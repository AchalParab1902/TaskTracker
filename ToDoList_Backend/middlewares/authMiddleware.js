const jwt = require("jsonwebtoken");
const { ACCESS_SECRET } = require("../utils/jwtHelpers");

function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No or invalid authorization token" });
  }

  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired access token" });
  }
}

module.exports = verifyAccessToken;
