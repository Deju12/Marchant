import express from "express";
import { sql } from "../config/db.js";
import crypto from "crypto";

const router = express.Router();

/**
 * 1. Request OTP
 */
router.post("/req_otp", async (req, res) => {
  const { merchant_id, phone_number } = req.body;
  await sql.execute(
  `DELETE FROM otps WHERE is_used = 1`
);
  if (!merchant_id || !phone_number) {
    return res.status(400).json({ message: "merchant_id and phone_number are required" });
  }

  try {
    // Check merchant exists
    const [merchantRows] = await sql.execute(
      `SELECT phone_number FROM merchants WHERE id = ?`,
      [merchant_id]
    );
    
    if (merchantRows.length === 0) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    // Generate OTP
    const otp_code = crypto.randomInt(100000, 999999).toString();
    const expires_at = new Date(Date.now() + 3 * 60000); // expires in 3 minutes

    // Insert OTP with merchant_id and phone_number
    await sql.execute(
      `INSERT INTO otps (merchant_id, phone_number, otp_code, otp_type, expires_at) 
       VALUES (?, ?, ?, 'activation', ?)`,
      [merchant_id, phone_number, otp_code, expires_at]
    );

    res.status(201).json({
      message: "OTP sent to merchant",
      merchant_phone: merchantRows[0].phone_number,
      otp_code, // remove in production
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
});

/**
 * 2. Verify OTP and Register Employee
 */
router.post("/ver_otp", async (req, res) => {
  const { otp_code } = req.body;

  if (!otp_code) {
    return res.status(400).json({ message: "OTP code is required" });
  }

  try {
    // Find OTP
    const [rows] = await sql.execute(
      `SELECT * FROM otps WHERE otp_code = ? ORDER BY created_at DESC LIMIT 1`,
      [otp_code]
    );

    const otp = rows[0];

    if (!otp) {
      return res.status(404).json({ message: "OTP not found" });
    }

    if (new Date() > new Date(otp.expires_at)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const { merchant_id, phone_number } = otp;

    if (!merchant_id || !phone_number) {
      return res.status(400).json({ message: "Missing merchant_id or phone_number in OTP record" });
    }

    // Check if employee already exists
    const [existing] = await sql.execute(
      `SELECT * FROM employee WHERE merchant_id = ? AND phone_number = ?`,
      [merchant_id, phone_number]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        message: "Employee already registered",
        employee: existing[0],
      });
    }

    // Register new employee
    const [insertResult] = await sql.execute(
      `INSERT INTO employee (merchant_id, phone_number) VALUES (?, ?)`,
      [merchant_id, phone_number]
    );
    
    await sql.execute(
  `UPDATE otps SET is_used = 1 WHERE otp_code = ?`,
  [otp_code]
);

    res.status(201).json({
      message: "OTP verified and employee registered",
      employee_id: insertResult.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
});

export default router;
