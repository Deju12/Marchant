import express from "express";
import { sql } from "../config/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { phone_number, pin_code } = req.body;

  if (!phone_number || !pin_code) {
    return res.status(400).json({ message: "Phone number and PIN code are required." });
  }

  try {
    // 1. Find employee by phone number
    const [employees] = await sql.execute(
      "SELECT id FROM employee WHERE phone_number = ?",
      [phone_number]
    );

    if (employees.length === 0) {
      return res.status(401).json({ message: "Invalid phone number or PIN." });
    }

    const employee_id = employees[0].id;

    // 2. Get hashed pin from pins table
    const [pins] = await sql.execute(
      "SELECT pin_hash FROM pins WHERE employee_id = ?",
      [employee_id]
    );

    if (pins.length === 0) {
      return res.status(401).json({ message: "PIN not set for this user." });
    }

    const pin_hash = pins[0].pin_hash;

    // 3. Compare pin_code with hash
    const match = await bcrypt.compare(pin_code, pin_hash);

    if (!match) {
      return res.status(401).json({ message: "Invalid phone number or PIN." });
    }

    // 4. Success (you can add JWT or session here)
    res.status(200).json({ message: "Login successful", employee_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

export default router;