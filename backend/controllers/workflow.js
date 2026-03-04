import pool from "../config/db.js";

/**
 * create workflow
 */
export const createWorkflow = async (req, res) => {
  const { name, version, input_schema, steps } = req.body;

  if (!name || !version || !input_schema?.schema || !Array.isArray(input_schema?.schema) || !Array.isArray(steps) || steps.length === 0){
    return res.status(400).json({ error: "All are required" });
  }

  try {
    await pool.query("BEGIN");

    const workflowResult = await pool.query(
      `INSERT INTO workflows (name, version, input_schema) VALUES ($1, $2, $3) RETURNING id`,
      [name, version, input_schema]
    );
    const workflowId = workflowResult.rows[0].id;

    if (steps && Array.isArray(steps)) {
      for (const step of steps) {
        const { name: stepName, step_type, step_order, metadata, condition, priority } = step;
        const stepResult = await pool.query(
          `INSERT INTO steps (workflow_id, name, step_type, step_order, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [workflowId, stepName, step_type, step_order, metadata]
        );

        const stepId = stepResult.rows[0].id;

        if (condition && Object.keys(condition).length > 0) {
          const conditionStr = Object.values(condition).join(" ");
          await pool.query(
            `INSERT INTO rules (step_id, condition, priority) VALUES ($1, $2, $3)`,
            [stepId, conditionStr, priority]
          );
        }
      }
    }

    await pool.query("COMMIT");

    res.status(201).json({ message: "Workflow created successfully", workflowId });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error creating workflow:", err);
    res.status(500).json({ error: "Failed to create workflow" });
  }
};

/**
 * get all workflow 
 */
export const getWorkflows = async (req, res) => {
  const { search, filter_by_assignee, is_active } = req.query;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const offset = (page - 1) * limit;

  try {
    let query = "SELECT * FROM workflows";
    const params = [];

    if (search) {
      query += " WHERE name ILIKE $1";
      params.push(`%${search}%`);
    }

    if (filter_by_assignee) {
      query += search ? " AND" : " WHERE";
      query += ` EXISTS (
        SELECT 1 FROM steps 
        WHERE steps.workflow_id = workflows.id 
        AND steps.metadata->>'assignee_email' = $${params.length + 1}
      )`;
      params.push(filter_by_assignee);
    }

    if(is_active !== undefined) {
      query += (search || filter_by_assignee) ? " AND" : " WHERE";
      query += ` is_active = $${params.length + 1}`;
      params.push(is_active === 'true' || is_active === true);
    }

    query += " ORDER BY id DESC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM workflows";
    if (search) {
      countQuery += " WHERE name ILIKE $1";
    }
    const countResult = await pool.query(countQuery, search ? [`%${search}%`] : []);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("Error fetching workflows:", err);
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
};

/**
 * get workflow by id
 */
export const getWorkflowById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM workflows WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching workflow:", err);
    res.status(500).json({ error: "Failed to fetch workflow" });
  }
};

/**
 * update workflow
 */
export const updateWorkflow = async (req, res) => {
  const { id } = req.params;
  const { name, version, input_schema } = req.body;

  try {
    const result = await pool.query(
      `UPDATE workflows SET name = $1, version = $2, input_schema = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [name, version, input_schema, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    res.json({ message: "Workflow updated successfully", workflow: result.rows[0] });
  } catch (err) {
    console.error("Error updating workflow:", err);
    res.status(500).json({ error: "Failed to update workflow" });
  }
};

/**
 * delete workflow
 */
export const deleteWorkflow = async (req, res) => {
  const { id }  = req.params;
  try {
    const result = await pool.query("DELETE FROM workflows WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    res.json({ message: "Workflow deleted successfully" });
  } catch (err) {
    console.error("Error deleting workflow:", err);
    res.status(500).json({ error: "Failed to delete workflow" });
  }
};