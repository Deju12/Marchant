import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// Verify OTP by otp_code only and register employee using data from otp record
router.post("/verify-otp", async (req, res) => {
  const { otp_code } = req.body;

  if (!otp_code) {
    return res.status(400).json({ message: "OTP code is required." });
  }

  try {
    // 1. Find OTP record by otp_code
    const [rows] = await sql.execute(
      `SELECT * FROM otps WHERE otp_code = ? ORDER BY created_at DESC LIMIT 1`,
      [otp_code]
    );

    const otp = rows[0];

    if (!otp) {
      return res.status(404).json({ message: "OTP not found" });
    }

    const now = new Date();
    if (now > new Date(otp.expires_at)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 2. Extract merchant_id and phone_number from the OTP record
    // Assuming your otps table stores merchant_id and phone_number
    const { merchant_id, phone_number, employee_id } = otp;

    // If your OTP table does not store phone_number, 
    // you may need to get it from employee or merchant table based on context

    if (!merchant_id || !phone_number) {
      return res.status(400).json({ message: "merchant_id or phone_number missing in OTP record" });
    }

    // 3. Register new employee after verification if not already registered
    // Check if employee with this phone_number and merchant_id already exists to avoid duplicates
    const [existingEmployees] = await sql.execute(
      `SELECT * FROM employee WHERE merchant_id = ? AND phone_number = ?`,
      [merchant_id, phone_number]
    );

    if (existingEmployees.length > 0) {
      return res.status(200).json({ message: "Employee already registered", employee: existingEmployees[0] });
    }

    // Insert new employee record
    const [insertResult] = await sql.execute(
      `INSERT INTO employee (merchant_id, phone_number) VALUES (?, ?)`,
      [merchant_id, phone_number]
    );

    const newEmployeeId = insertResult.insertId;

    res.status(201).json({
      message: "OTP verified and employee registered successfully",
      employee_id: newEmployeeId,
    });

  } catch (err) {
    res.status(500).json({ message: "OTP verification or registration failed", error: err.message });
  }
});

export default router;
