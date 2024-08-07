const multer = require('multer');
const uniqid = require('uniqid');
const path = require('path');


const TYPE_IMAGE = {
  "image/jpg":"jpg",
  "image/jpeg":"jpeg",
  "image/png":"png",
  "image/webp":"webp",
  "image/webm":"webm",
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {7
    cb(null, 'public/assets/images/barangdistributor'); 
  },
  filename: (req, file, cb) => {
    // const ext = TYPE_IMAGE[file.mimetype] 
    cb(null, Date.now() + uniqid() + path.extname(file.originalname));
  },
});

const barangdistributor = multer({ storage: storage });

module.exports = barangdistributor;