import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sql } from "../config/db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// POST /api/auth/customer-login
router.post("/", async (req, res) => {
  const { phone_number, pin_code } = req.body;

  if (!phone_number || !pin_code) {
    return res.status(400).json({ message: "Phone number and PIN are required" });
  }

  try {
    // 1. Find the customer
    const [customers] = await sql.execute(
      "SELECT id FROM customers WHERE phone_number = ? LIMIT 1",
      [phone_number]
    );

    if (customers.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const customer = customers[0];

    // 2. Get their PIN hash
    const [pins] = await sql.execute(
      "SELECT pin_hash FROM pins WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1",
      [customer.id]
    );

    if (pins.length === 0) {
      return res.status(404).json({ message: "PIN not found for customer" });
    }

    const { pin_hash } = pins[0];

    // 3. Compare hashes
    const match = await bcrypt.compare(pin_code, pin_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    // 4. Create token
    const token = jwt.sign({ customer_id: customer.id, phone_number }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

export default router;
