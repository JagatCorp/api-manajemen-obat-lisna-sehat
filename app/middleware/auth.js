const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../configs/database");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Missing token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Tambahkan role pengguna ke request untuk digunakan di endpoint terproteksi
    req.role = decoded.role;

    // Lanjutkan ke middleware berikutnya atau ke endpoint
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
