const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.ACCESS_SECRET || "Access_secret_key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "Refresh_secret_key";

const genAccessToken = (user) =>
  jwt.sign({ id: user.id }, ACCESS_SECRET, { expiresIn: "15m" });

const genRefreshToken = (user) =>
  jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

module.exports = {
  genAccessToken,
  genRefreshToken,
  ACCESS_SECRET,
  REFRESH_SECRET,
};
