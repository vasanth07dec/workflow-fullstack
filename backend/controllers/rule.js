import pool from "../config/db.js";

/**
 * get all rules based on step_id
 */
export const getRulesByStepId = async (req, res) => {
  const { stepId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM rules WHERE step_id = $1", [stepId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching rules:", err);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
}

/**
 * add rules
 */
export const addRuleToStep = async (req, res) => {
  const { stepId } = req.params;
  const { name, condition, action } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO rules (step_id, name, condition, action) VALUES ($1, $2, $3, $4) RETURNING id`,
      [stepId, name, condition, action]
    );
    res.status(201).json({ message: "Rule added successfully", ruleId: result.rows[0].id });
  } catch (err) {
    console.error("Error adding rule:", err);
    res.status(500).json({ error: "Failed to add rule" });
  }
};

/**
 * update rules
 */
export const updateRule = async (req, res) => {
  const { ruleId } = req.params;
  const { name, condition, action } = req.body;

  try {
    await pool.query(
      `UPDATE rules SET name = $1, condition = $2, action = $3, updated_at = NOW() WHERE id = $4`,
      [name, condition, action, ruleId]
    );
    res.json({ message: "Rule updated successfully" });
  } catch (err) {
    console.error("Error updating rule:", err);
    res.status(500).json({ error: "Failed to update rule" });
  }
};

/**
 * delete rules
 */
export const deleteRule = async (req, res) => {
  const { ruleId } = req.params;

  try {
    await pool.query(`DELETE FROM rules WHERE id = $1`, [ruleId]);
    res.json({ message: "Rule deleted successfully" });
  } catch (err) {
    console.error("Error deleting rule:", err);
    res.status(500).json({ error: "Failed to delete rule" });
  }
};