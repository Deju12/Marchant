import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = express.Router();

router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to the dashboard!",
    user: req.user, // { employee_id, phone_number }
  });
});

export default router;
