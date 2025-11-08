import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "./database.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = "1h";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = "aes-256-gcm";

function getKey() {
  return crypto.createHash("sha256").update(String(ENCRYPTION_KEY)).digest();
}

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decrypt(payload) {
  const data = Buffer.from(payload, "base64");
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export const loginHandler = async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  try {
    const [users] = await pool.query(
      `SELECT * FROM users WHERE username = "${username}"`
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const user = users[0];
    let stored;
    try {
      stored = decrypt(user.password);
    } catch (e) {
      console.error("decrypt error:", e);
      return res
        .status(500)
        .json({ error: "error decrypting stored password" });
    }

    if (password !== stored) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const token = jwt.sign({ username, userId: user.id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRES_IN,
    });
    return res.json({ token });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const authenticateToken = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth)
    return res.status(401).json({ error: "missing authorization header" });

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ error: "malformed authorization header" });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid or expired token" });
  }
};

// Função para criar um usuário no banco de dados
export const createUser = async (username, password) => {
  try {
    const encryptedPassword = encrypt(password);
    const [result] = await pool.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, encryptedPassword]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
