// server/config/index.js
require("dotenv").config();

const config = {
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET || "chumbi-nyiri-secret",
};

module.exports = config;
