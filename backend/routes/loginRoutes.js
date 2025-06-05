import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sql } from "../config/db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// POST /api/login
router.post("/login", async (req, res) => {
  const { phone_number, pin_code } = req.body;

  if (!phone_number || !pin_code) {
    return res.status(400).json({ message: "Phone number and PIN are required." });
  }

  try {
    // Find employee
    const [employees] = await sql.execute(
  "SELECT id, merchant_id, phone_number FROM employee WHERE phone_number = ?",
  [phone_number]
);

    if (employees.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employee = employees[0];

    // Get latest PIN
    const [pins] = await sql.execute(
      "SELECT pin_hash FROM pins WHERE employee_id = ? ORDER BY created_at DESC LIMIT 1",
      [employee.id]
    );

    if (pins.length === 0) {
      return res.status(404).json({ message: "PIN not found for this user" });
    }

    const match = await bcrypt.compare(pin_code, pins[0].pin_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    // Generate token
    const token = jwt.sign(
      { employee_id: employee.id, phone_number: employee.phone_number, merchant_id: employee.merchant_id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      employee_id: employee.id,
      phone_number: employee.phone_number, 
      token,
      merchant_id: employee.merchant_id
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
