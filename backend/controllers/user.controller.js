const db = require("../db");
const bcrypt = require("bcryptjs");

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.sub;

    const result = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { name, email, password } = req.body;

 
    let hashed = null;
    if (password && password.length >= 6) {
      hashed = await bcrypt.hash(password, 10);
    }

    const result = await db.query(
      `UPDATE users SET
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         password = COALESCE($3, password)
       WHERE id = $4
       RETURNING id, name, email, created_at`,
      [name || null, email || null, hashed, userId]
    );

    const user = result.rows[0];
    res.json({ user });
  } catch (err) {
    console.error("updateMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
