import pool from "../config/db.js";

/**
 * get all approver list which is manager and ceo
 */
export const getApproversList = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email FROM users WHERE role IN ('manager', 'ceo')");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching approvers:", err);
    res.status(500).json({ error: "Failed to fetch approvers" });
  }
}