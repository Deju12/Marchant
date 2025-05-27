import express from "express";
import { sql } from "../config/db.js";
import crypto from "crypto";

const router = express.Router();

router.post("/request_otp", async (req, res) => {
  const { merchant_id } = req.body;

  if (!merchant_id) {
    return res.status(400).json({ message: "merchant_id is required" });
  }

  try {
    // 1. Get merchant phone number
    const [merchantRows] = await sql.execute(
      `SELECT phone_number FROM merchants WHERE id = ?`,
      [merchant_id]
    );

    if (merchantRows.length === 0) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    const merchantPhone = merchantRows[0].phone_number;

    // 2. Generate OTP
    const otp_code = crypto.randomInt(100000, 999999).toString();
    const expires_at = new Date(Date.now() + 5 * 60000); // 5 minutes expiry

    // 3. Insert OTP linked to merchant_id
    await sql.execute(
      `INSERT INTO otps (merchant_id, otp_code, otp_type, expires_at) VALUES (?, ?, 'activation', ?)`,
      [merchant_id, otp_code, expires_at]
    );

    // TODO: Send OTP to merchantPhone via SMS gateway here

    res.status(201).json({
      message: "OTP sent to merchant",
      merchant_phone: merchantPhone,
      otp_code, // Remove this in production
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
});

export default router;
