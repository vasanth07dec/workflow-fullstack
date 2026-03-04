import pool from "../config/db.js";

/**
 * get all steps by workflow_id
 */
export const getStepsByWorkflowId = async (req, res) => {
  const { workflowId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM steps WHERE workflow_id = $1 ORDER BY step_order", [workflowId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching steps:", err);
    res.status(500).json({ error: "Failed to fetch steps" });
  }
};

/**
 * add steps to workflow
 */
export const addStepToWorkflow = async (req, res) => {
  const { workflowId } = req.params;
  const { name, step_type, step_order, metadata } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO steps (workflow_id, name, step_type, step_order, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [workflowId, name, step_type, step_order, metadata]
    );
    res.status(201).json({ message: "Step added successfully", stepId: result.rows[0].id });
  } catch (err) {
    console.error("Error adding step:", err);
    res.status(500).json({ error: "Failed to add step" });
  }
};

/**
 * update step
 */
export const updateStep = async (req, res) => {
  const { stepId } = req.params;
  const { name, step_type, step_order, metadata } = req.body;

  try {
    await pool.query(
      `UPDATE steps SET name = $1, step_type = $2, step_order = $3, metadata = $4, updated_at = NOW() WHERE id = $5`,
      [name, step_type, step_order, metadata, stepId]
    );
    res.json({ message: "Step updated successfully" });
  } catch (err) {
    console.error("Error updating step:", err);
    res.status(500).json({ error: "Failed to update step" });
  }
};

/**
 * delete step
 */
export const deleteStep = async (req, res) => {
  const { stepId } = req.params;

  try {
    await pool.query(`DELETE FROM steps WHERE id = $1`, [stepId]);
    res.json({ message: "Step deleted successfully" });
  } catch (err) {
    console.error("Error deleting step:", err);
    res.status(500).json({ error: "Failed to delete step" });
  }
};