const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../models");
const Administrator = db.administrators;
const { JWT_SECRET } = require("../configs/database"); // Mengimpor nilai JWT_SECRET dari file konfigurasi

// Fungsi login
// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Cari pengguna sebagai pasien
//     let user = await Pasien.findOne({
//       where: { username: username },
//     });

//     // Jika tidak ditemukan, coba cari sebagai dokter
//     if (!user) {
//       user = await Dokter.findOne({
//         where: { username: username },
//       });

//       // cek password
//       if (!user || !(await bcrypt.compare(password, user.password))) {
//         return res.status(401).json({ message: "Invalid username or password" });
//       }

//       const role = "dokter";
//       const token = jwt.sign({ id: user.id, role: role }, JWT_SECRET, {
//         expiresIn: "1h",
//       });

//       res.json({ token, id: user.id, urlGambar: user.urlGambar });
//     } else {
//       // cek password
//       if (!user || !(await bcrypt.compare(password, user.password))) {
//         return res.status(401).json({ message: "Invalid username or password" });
//       }

//       const role = "pasien";
//       const token = jwt.sign({ id: user.id, role: role }, JWT_SECRET, {
//         expiresIn: "1h",
//       });

//       res.json({ token, id: user.id });
//     }

//     // Tentukan peran berdasarkan model yang menemukan pengguna
//     // const role = user instanceof Pasien ? "pasien" : "dokter";

//     // Buat token JWT

//     // Kirim token sebagai respons
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await Administrator.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const role = "lisAd";
    const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: "1h" });

    return res.json({ token, id: user.id, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Fungsi logout
exports.logout = (req, res) => {
  try {
    // Dapatkan token dari header Authorization
    const token = req.header("Authorization");

    // Periksa jika token tidak ada
    if (!token) {
      return res.status(401).json({ message: "Missing token, logout failed" });
    }

    // Hapus token dari sisi klien (misalnya, dengan menghapus token dari local storage)
    // Hapus token dari local storage
    // localStorage.removeItem("token");
    // Implementasikan sesuai kebutuhan aplikasi Anda

    // Kirim respons logout berhasil
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const decodeJWTAndGetID = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded.id);
      }
    });
  });
};

exports.cekToken = async (req, res) => {
  try {
    // Dapatkan token dari header Authorization
    const authHeader = req.header("Authorization");
    
    console.log("Authorization Header:", authHeader); // Tambahkan ini untuk mencetak header Authorization

    if (!authHeader) {
      return res.status(401).json({ message: "Missing token" });
    }

    // Pastikan token menggunakan format Bearer
    const token = authHeader.split(' ')[1];
    
    console.log("Token received:", token); // Tambahkan ini untuk mencetak token

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Decode JWT untuk mendapatkan payload
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Failed to decode JWT", err });
      }

      // Ambil peran (role) dari payload JWT
      const { role } = decoded;

      if (!role) {
        return res.status(400).json({ message: "Role not found in JWT payload" });
      }

      res.json({ role, id: decoded.id, token: token });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};
