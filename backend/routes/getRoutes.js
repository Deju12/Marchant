import express from "express";
import {sql} from "../config/db.js";

const router = express.Router();

// 1. Get all merchants
router.get("/merchants", async (req, res) => {
  try {
    const [rows] = await sql.execute("SELECT * FROM merchants");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching merchants", error: err });
  }
});

// 2. Get all customers
router.get("/customers", async (req, res) => {
  try {
    const [rows] = await sql.execute("SELECT * FROM customers");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching customers", error: err });
  }
});

// 3. Get all OTPs
router.get("/otps", async (req, res) => {
  try {
    const [rows] = await sql.execute("SELECT * FROM otps");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching OTPs", error: err });
  }
});

// 4. Get all PINs
router.get("/pins", async (req, res) => {
  try {
    const [rows] = await sql.execute("SELECT * FROM pins");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching PINs", error: err });
  }
});

// 5. Get all transactions
router.get("/transactions", async (req, res) => {
  try {
    const [rows] = await sql.execute("SELECT * FROM transactions");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions", error: err });
  }
});

// 6. Get all device sessions
router.get("/device_sessions", async (req, res) => {
  try {
    const [rows] = await sql.execute("SELECT * FROM device_sessions");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching device sessions", error: err });
  }
});

// 7. Get all PIN change logs
router.get("/pin_change_logs", async (req, res) => {
  try {
    const [rows] = await sql.execute("SELECT * FROM pin_change_logs");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching PIN change logs", error: err });
  }
});

// 8. Get all deactivation requests
router.get("/deactivation_requests", async (req, res) => {
  try {
    const [rows] = await sql.execute("SELECT * FROM deactivation_requests");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching deactivation requests", error: err });
  }
});

// 9. Get all workers
router.get("/workers", async (req, res) => {
  try {
    const [rows] = await sql.execute("SELECT * FROM workers");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching workers", error: err });
  }
});



export default router;
