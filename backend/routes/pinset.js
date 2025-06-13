import express from "express";
import { sql } from "../config/db.js";
import bcrypt from "bcrypt";
const router = express.Router();


router.post("/pinset", async (req, res) => {
  const { phone_number, pin_code, repin_code, name, merchant_id } = req.body;

  if (!phone_number || !pin_code || !repin_code || !name || !merchant_id) {
    return res.status(400).json({ message: "Phone number, name, merchant ID, PIN code, and RePIN are required." });
  }
  if (pin_code !== repin_code) {
    return res.status(400).json({ message: "PIN codes do not match." });
  }
  try {
    // 1. Find employee by phone number
    const [employees] = await sql.execute(
      `SELECT id FROM employee WHERE phone_number = ?`,
      [phone_number]
    );

    let employee_id;
    if (employees.length === 0) {
      // Employee does not exist, insert new employee
      const [insertResult] = await sql.execute(
        `INSERT INTO employee (merchant_id, phone_number, name, is_active) VALUES (?, ?, ?, ?)`,
        [merchant_id, phone_number, name, true]
      );
      employee_id = insertResult.insertId;
    } else {
      employee_id = employees[0].id;
    }

    // 2. Check if PIN already exists for this employee
    const [existingPins] = await sql.execute(
      `SELECT id FROM pins WHERE employee_id = ?`,
      [employee_id]
    );
    if (existingPins.length > 0) {
      return res.status(409).json({ message: "PIN already set for this employee." });
    }

    // 3. Hash the PIN and insert
    const SALT_ROUNDS = 10;
    const hashedPin = await bcrypt.hash(pin_code, SALT_ROUNDS);

    const [result] = await sql.execute(
      `INSERT INTO pins (employee_id, pin_hash) VALUES (?, ?)`,
      [employee_id, hashedPin]
    );

    res.status(201).json({ message: "PIN created securely", pinId: result.insertId });
  } catch (err) {
    console.error("PIN creation error:", err, err?.message, err?.sqlMessage, err?.stack);
    return res.status(500).json({
      message: "Error creating PIN",
      error: err?.message || err?.sqlMessage || JSON.stringify(err) || "Unknown error"
    });
  }
});

export default router;