const bcrypt = require("bcryptjs");
const db = require("../db");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { setCookie, clearCookie } = require("../utils/cookie");

// helper për të kthyer user pa password
const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  created_at: row.created_at,
});

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }

    const exists = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hash]
    );

    const user = mapUser(result.rows[0]);

    const accessToken = createAccessToken({ userId: user.id });
    const refreshToken = createRefreshToken({ userId: user.id });

    // refresh token në cookie
    setCookie(res, refreshToken);

    return res.status(201).json({
      user,
      accessToken,
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    const userRow = result.rows[0];

    if (!userRow) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, userRow.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = mapUser(userRow);

    const accessToken = createAccessToken({ userId: user.id });
    const refreshToken = createRefreshToken({ userId: user.id });

    setCookie(res, refreshToken);

    return res.json({
      user,
      accessToken,
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /auth/me  (mbrohet me authenticate)
exports.me = async (req, res) => {
  try {
    const userId = req.user.sub; // nga verifyAccessToken
    const result = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE id=$1",
      [userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: mapUser(user) });
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /auth/refresh
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies[process.env.COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token); // merr sub = userId
    } catch (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const userId = payload.sub;

    //verifiko që user ekziston
    const result = await db.query("SELECT id FROM users WHERE id=$1", [userId]);
    if (!result.rows.length) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = createAccessToken({ userId });
    const newRefreshToken = createRefreshToken({ userId });

    // rifresko cookie-n me refresh token të ri
    setCookie(res, newRefreshToken);

    return res.json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("refresh error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /auth/logout
exports.logout = (req, res) => {
  clearCookie(res);
  res.json({ message: "Logged out" });
};
