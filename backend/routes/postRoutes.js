import express from "express";
import { sql } from "../config/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// 1. Add Merchant
router.post("/merchants", async (req, res) => {
  const { merchant_name, phone_number, email } = req.body;

  if (!merchant_name || !phone_number) {
    return res.status(400).json({ message: "Merchant name and phone number are required." });
  }

  try {
    const [result] = await sql.execute(
      `INSERT INTO merchants (merchant_name, phone_number, email) VALUES (?, ?, ?)`,
      [merchant_name, phone_number, email || null]
    );
    res.status(201).json({ message: "Merchant created", merchantId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating merchant", error: err });
  }
});

// 2. Add Customer
router.post("/customers", async (req, res) => {
  const { merchant_id, phone_number, is_active } = req.body;

  if (!merchant_id || !phone_number) {
    return res.status(400).json({ message: "Merchant ID and phone number are required." });
  }

  try {
    const [result] = await sql.execute(
      `INSERT INTO customers (merchant_id, phone_number, is_active) VALUES (?, ?, ?)`,
      [merchant_id, phone_number, is_active ?? true]
    );
    res.status(201).json({ message: "Customer created", customerId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating customer", error: err });
  }
});

// 3. Add OTP
router.post("/otps", async (req, res) => {
  const { customer_id, otp_code, otp_type, expires_at } = req.body;

  if (!customer_id || !otp_code || !otp_type || !expires_at) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const [result] = await sql.execute(
      `INSERT INTO otps (customer_id, otp_code, otp_type, expires_at) VALUES (?, ?, ?, ?)`,
      [customer_id, otp_code, otp_type, expires_at]
    );
    res.status(201).json({ message: "OTP created", otpId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating OTP", error: err });
  }
});

// 4. Add PIN
router.post("/pins", async (req, res) => {
  const { customer_id, pin_code } = req.body;

  if (!customer_id || !pin_code) {
    return res.status(400).json({ message: "Customer ID and PIN code are required." });
  }

  try {
    const SALT_ROUNDS = 10;
    const hashedPin = await bcrypt.hash(pin_code, SALT_ROUNDS);

    const [result] = await sql.execute(
      `INSERT INTO pins (customer_id, pin_hash) VALUES (?, ?)`,
      [customer_id, hashedPin]
    );

    res.status(201).json({ message: "PIN created securely", pinId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating PIN", error: err });
  }
});
// 5. Add Transaction
router.post("/transactions", async (req, res) => {
  const { merchant_id, transaction_type, amount, currency, status, details } = req.body;

  if (!merchant_id || !transaction_type || !amount || !currency || !status) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const [result] = await sql.execute(
      `INSERT INTO transactions (merchant_id, transaction_type, amount, currency, status, details) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [merchant_id, transaction_type, amount, currency, status, details || null]
    );
    res.status(201).json({ message: "Transaction added", transactionId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating transaction", error: err });
  }
});

// 6. Add Device Session
router.post("/device_sessions", async (req, res) => {
  const { customer_id, device_info, is_logged_in } = req.body;

  if (!customer_id || !device_info) {
    return res.status(400).json({ message: "Customer ID and device info required." });
  }

  try {
    const [result] = await sql.execute(
      `INSERT INTO device_sessions (customer_id, device_info, is_logged_in) VALUES (?, ?, ?)`,
      [customer_id, device_info, is_logged_in ?? true]
    );
    res.status(201).json({ message: "Device session added", sessionId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating device session", error: err });
  }
});

// 7. Add PIN Change Log
router.post("/pin_change_logs", async (req, res) => {
  const { customer_id } = req.body;

  if (!customer_id) {
    return res.status(400).json({ message: "Customer ID required." });
  }

  try {
    const [result] = await sql.execute(
      `INSERT INTO pin_change_logs (customer_id) VALUES (?)`,
      [customer_id]
    );
    res.status(201).json({ message: "PIN change logged", logId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error logging PIN change", error: err });
  }
});

// 8. Add Deactivation Request
router.post("/deactivation_requests", async (req, res) => {
  const { customer_id, otp_sent, confirmed, completed_at } = req.body;

  if (!customer_id) {
    return res.status(400).json({ message: "Customer ID required." });
  }

  try {
    const [result] = await sql.execute(
      `INSERT INTO deactivation_requests (customer_id, otp_sent, confirmed, completed_at) VALUES (?, ?, ?, ?)`,
      [customer_id, otp_sent ?? false, confirmed ?? false, completed_at || null]
    );
    res.status(201).json({ message: "Deactivation request created", requestId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating request", error: err });
  }
});
// 9. workers
router.post("/workers", async (req, res) => {
  const { merchant_id, phone_number, is_active } = req.body;

  if (!merchant_id || !phone_number) {
    return res.status(400).json({ message: "Merchant ID and phone number are required." });
  }

  try {
    const [result] = await sql.execute(
      `INSERT INTO workers (merchant_id, phone_number, is_active) VALUES (?, ?, ?)`,
      [merchant_id, phone_number, is_active ?? true]
    );
    res.status(201).json({ message: "Worker created", customerId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating worker", error: err });
  }
});


export default router;
