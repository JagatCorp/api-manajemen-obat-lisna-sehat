const db = require("../models");
const Dokter = db.dokter;
const SpesialisDokter = db.spesialisdokters;
const JSONAPISerializer = require("jsonapi-serializer").Serializer;
const dokterMiddleware = require("../middleware/dokter"); // Import middleware dokter
const { Op } = require("sequelize");

// Create and Save a new dokter
// exports.create = async (req, res) => {
//   try {
//     // Validate request
//     const requiredFields = ['nama_dokter', 'mulai_praktik', 'selesai_praktik', 'hari_praktik', 'spesialis_dokter_id'];
//     const missingFields = requiredFields.filter(field => !req.body[field]);

//     if (missingFields.length > 0) {
//       return res.status(400).send({ message: `Data is required for the following fields: ${missingFields.join(', ')}` });
//     }

//     const spesialis_dokter = await SpesialisDokter.findByPk(req.body.spesialis_dokter_id);
//     if (!spesialis_dokter) {
//       return res.status(404).send({ message: "spesialis_dokter not found!" });
//     }

//     // Create dokter object with layanan_id
//     const dokter = {
//       nama_dokter: req.body.nama_dokter,
//       mulai_praktik: req.body.mulai_praktik,
//       selesai_praktik: req.body.selesai_praktik,
//       hari_praktik: req.body.hari_praktik,
//       spesialis_dokter_id: req.body.spesialis_dokter_id,
//     //   gambar_dokter: req.file.path // Menyimpan path file gambar
//     };

//     // Save dokter to the database
//     const createdDokter = await Dokter.create(dokter);
//     res.send(createdDokter);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: error.message || "Error creating dokter." });
//   }
// };

exports.create = async (req, res) => {
  try {
    // Pastikan bahwa data yang diterima sesuai dengan yang diharapkan
    const {
      nama_dokter,
      mulai_praktik,
      selesai_praktik,
      hari_praktik,
      spesialis_dokter_id,
    } = req.body;
    if (
      !nama_dokter ||
      !mulai_praktik ||
      !selesai_praktik ||
      !hari_praktik ||
      !spesialis_dokter_id
    ) {
      return res.status(400).send({ message: "All fields are required!" });
    }

    // Pastikan bahwa file gambar telah diunggah
    if (!req.file) {
      return res.status(400).send({ message: "Image file is required!" });
    }

    // Proses file gambar yang diunggah
    const imageName = req.file.filename;
    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/assets/images/dokter/${imageName}`;

    // Cek apakah spesialis_dokter dengan id yang diberikan ada dalam database
    const spesialis_dokter = await SpesialisDokter.findByPk(
      spesialis_dokter_id
    );
    if (!spesialis_dokter) {
      return res.status(404).send({ message: "Spesialis Dokter not found!" });
    }

    // Buat objek dokter dengan informasi gambar
    const dokter = {
      nama_dokter,
      mulai_praktik,
      selesai_praktik,
      hari_praktik,
      spesialis_dokter_id,
      gambar_dokter: imageName,
      urlGambar: imageUrl,
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

// code benar tapi salah
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
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
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
    res.status(500).send({ message: "Error retrieving dokters." });
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

  Dokter.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "dokter was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update dokter with id=${id}. Maybe dokter was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating dokter with id=" + id,
      });
    });
};

// Delete a dokter with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Dokter.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "dokter was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete dokter with id=${id}. Maybe dokter was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete dokter with id=" + id,
      });
    });
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
