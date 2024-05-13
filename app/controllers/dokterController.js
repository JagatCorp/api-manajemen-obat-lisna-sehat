const db = require("../models");
const Dokter = db.dokter;
const SpesialisDokter = db.spesialisdokter;
const JSONAPISerializer = require("jsonapi-serializer").Serializer;
const dokterMiddleware = require("../middleware/dokter"); // Import middleware dokter
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const fs = require('fs');

// Fungsi untuk menghapus file gambar
const deleteImage = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Gagal menghapus file:', err);
      return;
    }
    console.log('File berhasil dihapus:', filePath);
  });
};

exports.create = async (req, res) => {
  try {
    // Pastikan bahwa data yang diterima sesuai dengan yang diharapkan
    const {
      nama_dokter,
      mulai_praktik,
      selesai_praktik,
      hari_praktik,
      spesialis_dokter_id,
      username,
      password,
      jk,
    } = req.body;
    if (
      !nama_dokter ||
      !mulai_praktik ||
      !selesai_praktik ||
      !hari_praktik ||
      !spesialis_dokter_id ||
      !username ||
      !password ||
      !jk
    ) {
      return res.status(400).send({ message: "All fields are required!" });
    }

    // Pastikan bahwa file gambar telah diunggah
    if (!req.file) {
      return res.status(400).send({ message: "Image file is required!" });
    }

    // Proses file gambar yang diunggah
    const imageName = req.file.filename;
    // local
    // const imageUrl = `${req.protocol}://${req.get("host")}/dokter/${imageName}`;
    // production
    const imageUrl = `https://api.lisnasehat.online/dokter/${imageName}`;

    // Cek apakah spesialis_dokter dengan id yang diberikan ada dalam database
    const spesialis_dokter = await SpesialisDokter.findByPk(
      spesialis_dokter_id
    );
    if (!spesialis_dokter) {
      return res.status(404).send({ message: "Spesialis Dokter not found!" });
    }

    // Hash password securely using bcrypt
    const saltRounds = 10; // Adjust salt rounds as needed (higher for stronger hashing)
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Buat objek dokter dengan informasi gambar
    const dokter = {
      nama_dokter,
      mulai_praktik,
      selesai_praktik,
      hari_praktik,
      spesialis_dokter_id,
      gambar_dokter: imageName,
      urlGambar: imageUrl,
      username,
      jk,
      password: hashedPassword,
    };

    // Simpan dokter ke dalam database
    const createdDokter = await Dokter.create(dokter);

    // Respon dengan data dokter yang telah dibuat
    res.send(createdDokter);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: error.message || "Error creating dokter.",
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    // Mendapatkan nilai halaman dan ukuran halaman dari query string (default ke halaman 1 dan ukuran 10 jika tidak disediakan)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Menghitung offset berdasarkan halaman dan ukuran halaman
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";

    // Query pencarian
    const searchQuery = {
      where: {
        [Op.or]: [{ nama_dokter: { [Op.like]: `%${keyword}%` } }],
      },
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: SpesialisDokter,
          attributes: ["nama_spesialis", "harga", "is_dokter_gigi"],
        },
      ],
    };

    const dokter = await Dokter.findAll(searchQuery);
    const totalCount = await Dokter.count(searchQuery);
    // Menghitung total jumlah dokter
    // const totalCount = await Dokter.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: dokter,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: error.message || "Error retrieving dokters." });
  }
};

// Find a single admin with an id

exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    // res.status(200).send({ message: req.params.id });

    const dokter = await Dokter.findByPk(id, {
      include: [
        {
          model: SpesialisDokter,
          attributes: ["nama_spesialis", "harga", "is_dokter_gigi"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!dokter) {
      return res.status(404).send({
        message: `Cannot find dokter with id=${id}.`,
      });
    }

    res.send(dokter);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving dokter with id=${id}`,
    });
  }
};

// Update a dokter by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const { nama_dokter, mulai_praktik, selesai_praktik, hari_praktik, jk, username, password } =
    req.body;

  // Menginisialisasi variabel untuk gambar
  let imageName, imageUrl, spesialis_dokter_id;

  // Cek apakah spesialis_dokter_id sudah ada di req.body (dapat dari form-data)
  if (req.body.spesialis_dokter_id) {
    spesialis_dokter_id = req.body.spesialis_dokter_id;
  }

  try {
    // Memperbarui data dokter dalam database
    let dokter = await Dokter.findByPk(id);

    // Memeriksa apakah file telah diunggah
    if (req.file == null) {
      imageName = dokter.imageName;
      imageUrl = dokter.imageUrl;
    } else {
      // Jika file diunggah, proses file gambar yang diunggah
      imageName = req.file.filename;
      imageUrl = `${req.protocol}://${req.get("host")}/dokter/${imageName}`;

      let filePath = 'public/assets/images/dokter/' + dokter.gambar_dokter;
      if (fs.existsSync(filePath)) {
        deleteImage(filePath);
      }
    }

    if (!dokter) {
      return res.status(404).send({
        message: `Cannot update dokter with id=${id}. Dokter not found!`,
      });
    }
    // return res.status(404).send({
    //   message: password,
    // });

    // Hash password securely using bcrypt
    const saltRounds = 10; // Adjust salt rounds as needed (higher for stronger hashing)
    let hashedPassword = '';
    if (password != '') {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } else {
      hashedPassword = dokter.password;
    }

    // Memperbarui data dokter dengan data yang diberikan
    dokter.nama_dokter = nama_dokter;
    dokter.mulai_praktik = mulai_praktik;
    dokter.selesai_praktik = selesai_praktik;
    dokter.hari_praktik = hari_praktik;

    dokter.jk = jk;
    dokter.username = username;
    dokter.password = hashedPassword;

    // Memeriksa apakah spesialis_dokter_id telah disertakan dalam form-data atau JSON
    if (req.body.spesialis_dokter_id) {
      dokter.spesialis_dokter_id = req.body.spesialis_dokter_id;
    }

    // Menggunakan gambar baru jika ada, jika tidak, tetap menggunakan gambar lama
    if (imageName && imageUrl) {
      dokter.gambar_dokter = imageName;
      dokter.urlGambar = imageUrl;
    }

    // Menyimpan perubahan ke dalam database
    await dokter.save();

    if(req.body.profile){
      res.send({ message: "dokter was updated successfully.", urlGambar: imageUrl});
    } else {
      res.send({ message: "dokter was updated successfully."});
    }
  } catch (error) {
    res.status(500).send({ message: "Error updating dokter with id=" + id + ', ' + error });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    let dokter = await Dokter.findByPk(id);
    if (!dokter) {
      return res.status(404).send({
        message: `Dokter with id=${id} was not found.`,
      });
    }

    // Hapus entitas dokter dari database
    await dokter.destroy();

    let filePath = 'public/assets/images/dokter/' + dokter.gambar_dokter;
    if (fs.existsSync(filePath)) {
      deleteImage(filePath);
    }

    res.send({
      message: "Dokter was deleted successfully!",
    });
  } catch (err) {
    console.error("Error deleting dokter:", err);
    res.status(500).send({
      message: "Could not delete dokter with id=" + id,
    });
  }
};



// Delete all dokters from the database.
exports.deleteAll = (req, res) => {
  Dokter.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} dokters were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all dokters.",
      });
    });
};
