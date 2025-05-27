import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// Utility to check if row exists
async function recordExists(table, id) {
  const [rows] = await sql.execute(`SELECT 1 FROM ${table} WHERE id = ? LIMIT 1`, [id]);
  return rows.length > 0;
}

// ---------- GENERIC STRUCTURE ---------- //
// Update and Delete for all 8 tables

const tables = [
  "merchants",
  "customers",
  "otps",
  "pins",
  "transactions",
  "device_sessions",
  "pin_change_logs",
  "deactivation_requests",
  "workers"
];

// Create update and delete routes dynamically
tables.forEach((table) => {
  // PUT /api/<table>/:id
  router.put(`/${table}/:id`, async (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Update data required." });
    }

    try {
      const exists = await recordExists(table, id);
      if (!exists) return res.status(404).json({ message: `${table} record not found.` });

      const setClause = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = [...Object.values(updates), id];

      await sql.execute(`UPDATE ${table} SET ${setClause} WHERE id = ?`, values);
      res.status(200).json({ message: `${table} record updated.` });
    } catch (err) {
      res.status(500).json({ message: `Error updating ${table}`, error: err });
    }
  });

  // DELETE /api/<table>/:id
  router.delete(`/${table}/:id`, async (req, res) => {
    const id = req.params.id;

    try {
      const exists = await recordExists(table, id);
      if (!exists) return res.status(404).json({ message: `${table} record not found.` });

      await sql.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
      res.status(200).json({ message: `${table} record deleted.` });
    } catch (err) {
      res.status(500).json({ message: `Error deleting ${table}`, error: err });
    }
  });
});

export default router;
