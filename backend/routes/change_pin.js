import express from "express";
import { sql } from "../config/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

/**
 * Change PIN for an employee
 * Expects: { phone_number, old_pin, new_pin }
 */
router.post("/change_pin", async (req, res) => {
  const { phone_number, old_pin, new_pin } = req.body;

  if (!phone_number || !old_pin || !new_pin) {
    return res.status(400).json({ message: "phone_number, old_pin, and new_pin are required." });
  }

  try {
    // 1. Find employee by phone number
    const [employees] = await sql.execute(
      `SELECT id FROM employee WHERE phone_number = ?`,
      [phone_number]
    );
    if (employees.length === 0) {
      return res.status(404).json({ message: "Phone number not registered." });
    }
    const employee_id = employees[0].id;

    // 2. Get the current PIN hash
    const [pins] = await sql.execute(
      `SELECT id, pin_hash FROM pins WHERE employee_id = ?`,
      [employee_id]
    );
    if (pins.length === 0) {
      return res.status(404).json({ message: "PIN not set for this employee." });
    }
    const pinId = pins[0].id;
    const pinHash = pins[0].pin_hash;

    // 3. Verify old PIN
    const isMatch = await bcrypt.compare(old_pin, pinHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old PIN is incorrect." });
    }

    // 4. Hash new PIN and update
    const SALT_ROUNDS = 10;
    const newPinHash = await bcrypt.hash(new_pin, SALT_ROUNDS);

    await sql.execute(
      `UPDATE pins SET pin_hash = ? WHERE id = ?`,
      [newPinHash, pinId]
    );

    res.status(200).json({ message: "PIN changed successfully." });
  } catch (err) {
    console.error("PIN change error:", err, err?.message, err?.sqlMessage, err?.stack);
    return res.status(500).json({
      message: "Error changing PIN",
      error: err?.message || err?.sqlMessage || JSON.stringify(err) || "Unknown error"
    });
  }
});

export default router;