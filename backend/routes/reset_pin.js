router.post("/pins", async (req, res) => {
  const { employee_id, pin_code, repin_code } = req.body;

  if (!employee_id || !pin_code || repin_code) {
    return res.status(400).json({ message: "employee ID and PIN code , RePIN are required." });
  }
  if(pin_code != repin_code){
    return res.status(500).json({message:"pin is not mach"})
  }

  try {
    const SALT_ROUNDS = 10;
    const hashedPin = await bcrypt.hash(pin_code, SALT_ROUNDS);

    const [result] = await sql.execute(
      `INSERT INTO pins (employee_id, pin_hash) VALUES (?, ?)`,
      [employee_id, hashedPin]
    );

    res.status(201).json({ message: "PIN created securely", pinId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating PIN", error: err });
  }
});