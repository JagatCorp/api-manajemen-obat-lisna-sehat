const multer = require('multer');
const uniqid = require('uniqid');
const path = require('path');

const TYPE_IMAGE = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/webm": "webm",
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/assets/images/obat'); 
  },
  filename: (req, file, cb) => {
    const ext = TYPE_IMAGE[file.mimetype] || path.extname(file.originalname); // Menggunakan ekstensi berdasarkan mimetype jika ada, jika tidak, gunakan extname dari originalname
    cb(null, Date.now() + uniqid() + '.' + ext); // Pastikan untuk menambahkan titik sebelum ekstensi
  },
});

const obat = multer({ storage: storage });

module.exports = obat;