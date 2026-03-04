import pool from "../config/db.js";
import { emailSender } from "../utils/emailSender.js";
import { expressionParser } from "../utils/parseExp.js";

/**
 * create new execution
 */
export const addExecutionsToWorkflow = async (req, res) => {
  const { workflow_id } = req.params;
  const { input_data, status = "pending", triggered_by } = req.body;

  if (!workflow_id) {
    return res.status(400).json({ error: "Workflow ID is required" });
  }
  console.log(workflow_id, "workflow_id");

  try {
    const result = await pool.query(
      `INSERT INTO executions (workflow_id, data, status, workflow_version, triggered_by) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [workflow_id, input_data, status, 1, triggered_by],
    );

    /**
     * while execute check condition if not satisfy reject it, otherwise allow for send to approvers
     */
    const stepsResult = await pool.query(
      `SELECT * FROM steps WHERE workflow_id = $1`,
      [workflow_id],
    );
    const steps = stepsResult.rows;

    const isNotificationOnlyOnSteps =
      steps?.length === 1 && steps[0]?.step_type === "notification";

    const ruleResult = await pool.query(
      `SELECT condition FROM rules WHERE step_id = $1`,
      [steps[0]?.id],
    );

    const rule = ruleResult.rows[0]?.condition;
    console.log(
      steps,
      isNotificationOnlyOnSteps,
      steps?.length,
      steps[0]?.step_type,
      rule,
      "single step check",
    );
    /**
     * if there 1 step and that notification
     * we need to sent mail and directly complete the execution
     *
     * else if there approval and notification
     * sent notification only and for approval type change status to pending state
     */
    if (isNotificationOnlyOnSteps && rule) {
      console.log(input_data, "input_data");
      const condition = expressionParser(rule, input_data);
      console.log(condition, "condition");
      if (condition) {
        await pool.query(
          `UPDATE executions SET status = 'completed', ended_at = NOW() WHERE id = $1 AND status IN ('pending', 'in_progress')`,
          [result.rows[0].id],
        );

        const to = steps[0]?.metadata.assignee_email;

        emailSender(
          to,
          "Execution happened! for workflow",
          `workflow_id: ${workflow_id}, amount: ${input_data.amount} `,
        );
      } else {
        await pool.query(
          `UPDATE executions SET status = 'canceled', ended_at = NOW() WHERE id = $1 AND status IN ('pending', 'in_progress')`,
          [result.rows[0].id],
        );
      }
    } else {
      for (const step of steps) {
        const ruleResult = await pool.query(
          `SELECT condition FROM rules WHERE step_id = $1`,
          [step.id],
        );
        const rule = ruleResult.rows[0]?.condition;

        if (rule) {
          const condition = expressionParser(rule, input_data);
          console.log(condition, input_data, "conditionMet");
          if (condition && step.step_type === "notification") {
            const to = step.metadata.assignee_email;

            emailSender(
              to,
              "Execution happened! for workflow",
              `workflow_id: ${workflow_id}, amount: ${input_data.amount} `,
            );
          }
          if (!condition) {
            console.log(result.rows[0], condition, "in if");
            // Update execution status to failed
            await pool.query(
              `UPDATE executions SET status = 'failed', ended_at = NOW() WHERE id = $1`,
              [result.rows[0].id],
            );
          }
        }
      }
    }

    const updateResult = await pool.query(
      `UPDATE workflows SET is_active = true WHERE id = $1`,
      [workflow_id],
    );
    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    res.status(201).json({
      message: "Execution added successfully",
      executionId: result.rows[0].id,
    });
  } catch (err) {
    console.error("Error adding execution:", err);
    res.status(500).json({ error: "Failed to add execution" });
  }
};

/**
 * get execution by id
 */
export const getExecutionById = async (req, res) => {
  const { executionId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM executions WHERE id = $1", [
      executionId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Execution not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching execution:", err);
    res.status(500).json({ error: "Failed to fetch execution" });
  }
};

export const approveExecution = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE executions SET status = 'completed', ended_at = NOW() WHERE id = $1 AND status IN ('pending', 'in_progress')`,
      [id],
    );
    res.json({ message: "Execution approved successfully" });
  } catch (err) {
    console.error("Error approve execution:", err);
    res.status(500).json({ error: "Failed to approve execution" });
  }
};

/**
 * cancel the execution workflow
 */
export const cancelExecution = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE executions SET status = 'canceled', ended_at = NOW() WHERE id = $1 AND status IN ('pending', 'in_progress')`,
      [id],
    );
    res.json({ message: "Execution cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling execution:", err);
    res.status(500).json({ error: "Failed to cancel execution" });
  }
};

/**
 * retry the execution make again go to pending state
 */
export const retryExecution = async (req, res) => {
  const { executionId } = req.params;
  try {
    await pool.query(
      `UPDATE executions SET status = 'pending', retries = retries + 1, started_at = NULL, ended_at = NULL WHERE id = $1 AND status IN ('failed', 'cancelled')`,
      [executionId],
    );
    res.json({ message: "Execution retried successfully" });
  } catch (err) {
    console.error("Error retrying execution:", err);
    res.status(500).json({ error: "Failed to retry execution" });
  }
};

/**
 * get all execution with more info like workflow, steps, user info by JOIN method
 */
export const getExecutedWorkflows = async (req, res) => {
  const { filter_by_assignee, status } = req.query;

  try {
    let query = `SELECT e.*, w.name as workflow_name, u.name as triggered_by_name, w.created_at
      FROM executions e
      JOIN workflows w ON w.id = e.workflow_id
      JOIN steps s ON s.workflow_id = w.id
      JOIN users u ON u.id = e.triggered_by`;

    const params = [];
    if (filter_by_assignee) {
      query += ` WHERE s.metadata->>'assignee_email' = $${params.length + 1}`;
      params.push(filter_by_assignee);
    }

    if (status) {
      query += filter_by_assignee
        ? ` AND e.status = $${params.length + 1}`
        : ` WHERE e.status = $${params.length + 1}`;
      params.push(status);
    }

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching executed workflows:", error);
    res.status(500).json({ error: "Failed to fetch executed workflows" });
  }
};
