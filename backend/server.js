require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql
  .createConnection({
    host: "localhost",
    user: "root",
    password: "rasuljon!@#",
    database: "user_management",
  })
  .promise();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;

    const [rows] = await db.query("SELECT status FROM users WHERE id = ?", [
      decoded.id,
    ]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ error: "Account is blocked." });
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ error: "Invalid token." });
  }
};

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    res.status(201).send("User registered");
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send("Error during registration");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    console.log("User found:", rows);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Comment

    if (user.status === "blocked") {
      return res.status(403).json({ error: "Account is blocked" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.use(verifyToken);

app.get("/users", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT id, name, email, last_login, registration_time, status FROM users"
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/block-users", async (req, res) => {
  const { userIds } = req.body;
  console.log(userIds);

  try {
    await db.query('UPDATE users SET status = "blocked" WHERE id IN (?)', [
      userIds,
    ]);
    res.status(200).send("Users blocked successfully");
  } catch (err) {
    res.status(500).send("Error blocking users");
  }
});

app.post("/unblock-users", async (req, res) => {
  const { userIds } = req.body;
  try {
    await db.query('UPDATE users SET status = "active" WHERE id IN (?)', [
      userIds,
    ]);
    res.status(200).send("Users unblocked successfully");
  } catch (err) {
    res.status(500).send("Error unblocking users");
  }
});

app.post("/delete-users", async (req, res) => {
  const { userIds } = req.body;

  try {
    const result = await db.query("DELETE FROM users WHERE id IN (?)", [
      userIds,
    ]);
    res.json({
      message: `${result.affectedRows} user(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Delete users error:", error);
    res.status(500).json({ error: "Failed to delete users" });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
