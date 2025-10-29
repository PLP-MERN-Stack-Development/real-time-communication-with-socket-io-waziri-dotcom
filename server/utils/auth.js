// server/utils/auth.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "chumbi-nyiri-secret";

function generateToken(user) {
  return jwt.sign({ username: user.username }, SECRET, { expiresIn: "24h" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
