const db = require("../models");
const TransaksiMedis = db.transaksi_medis;
const SpesialisDokter = db.spesialisdokter;
const Dokter = db.dokter;
const Pasien = db.pasien;
const qr = require("qrcode");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");
const Spesialisdokter = require("../models/Spesialisdokter");

// Create and Save a new transaksi_medis
exports.create = async (req, res) => {
  try {
    // Validate request
    // if (!req.body.pasien_id || !req.body.dokter_id) {
    //   return res.status(400).send({ message: "Data is required!" });
    // }

    // Find Dokter by dokter_id
    const dokter = await Dokter.findByPk(req.body.dokter_id);
    if (!dokter) {
      return res.status(404).send({ message: "Dokter not found!" });
    }
    
    const spesialis_dokter = await SpesialisDokter.findByPk(dokter.spesialis_dokter_id);
    if (!spesialis_dokter) {
      return res.status(404).send({ message: "Spesialis Dokter not found!" });
    }

    dokter['spesialis_dokter'] = spesialis_dokter;

    // Find Pasien by pasien_id
    const pasien = await Pasien.findByPk(req.body.pasien_id);
    if (!pasien) {
      return res.status(404).send({ message: "Pasien not found!" });
    }

    // Generate a unique filename for the QR code image using uuid
    const filename = `${uuidv4()}.png`;

    // Path untuk menyimpan gambar QR code di dalam direktori public
    const qrCodePath = path.join(
      __dirname,
      `../../public/assets/images/qrcode/${filename}`
    );

    // Create transaksi_medis object
    const transaksi_medis = {
      pasien_id: req.body.pasien_id,
      dokter_id: req.body.dokter_id,
      pasien: pasien.toJSON(),
      dokter: dokter.toJSON(),
      keluhan: req.body.keluhan,
    };

    // Generate QR code and save it as a file
    qr.toFile(qrCodePath, JSON.stringify(transaksi_medis), async (err) => {
      if (err) {
        console.error("Error generating QR code:", err);
        return res.status(500).send({ message: "Error generating QR code." });
      }

      // Generate URL for the QR code image local
      // const qrCodeUrl = `${req.protocol}://${req.get(
      //   "host"
      // )}/qrcode/${filename}`;
      // production
      const qrCodeUrl = `https://lisnasehat.online/
      )}/qrcode/${filename}`;

      // Add QR code URL to the transaksi_medis object
      transaksi_medis.url_qrcode = qrCodeUrl;

      // Create the transaction record with QR code URL
      const createdTransaksiMedis = await TransaksiMedis.create(
        transaksi_medis
      );

      // Send the response with the QR code URL and associated data
      res.send({
        pasien_id: transaksi_medis.pasien_id,
        dokter_id: transaksi_medis.dokter_id,
        pasien: transaksi_medis.pasien,
        dokter: transaksi_medis.dokter,
        keluhan: transaksi_medis.keluhan,
        qrCodeUrl: qrCodeUrl,
      });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: error.message || "Error creating transaksi_medis." });
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
      // pengen nyari apa???
      // where: {
      //   [Op.or]: [
      //     { nama: { [Op.like]: `%${keyword}%` } },
      //   ],
      // },
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Pasien,
          attributes: [
            "nama",
            "jk",
            "no_telp",
            "alergi",
            "tgl_lahir",
            "gol_darah",
            "alamat",
          ],
        },
        {
          model: Dokter,
          attributes: [
            "nama_dokter",
            "mulai_praktik",
            "selesai_praktik",
            "hari_praktik",
            "spesialis_dokter_id",
            "urlGambar",
          ],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    };

    const transaksi_medis = await TransaksiMedis.findAll(searchQuery);
    const totalCount = await TransaksiMedis.count(searchQuery);
    // Menghitung total jumlah transaksi_medis
    // const totalCount = await TransaksiMedis.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    // const transaksi_medisData = transaksi_medisSerializer.serialize(transaksi_medis);

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: transaksi_medis,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving transaksi_mediss." });
  }
};

// exports.findQrCode = async (req, res) => {
//   const idPasien = req.query.id_pasien; // Menggunakan req.query untuk mendapatkan id_pasien dari query string

//   try {
//     // Cari satu data transaksi medis berdasarkan id pasien
//     const qrCode = await TransaksiMedis.findOne({ pasien_id: idPasien });

//     if (!qrCode) {
//       return res
//         .status(404)
//         .json({ message: "QR code not found for this patient ID" });
//     }

//     // Jika ditemukan, kirim data QR code sebagai respons
//     res.status(200).json({ data: qrCode });
//   } catch (error) {
//     console.error("Error fetching QR code:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// Find a single admin with an id
// exports.findOne = async (req, res) => {
//   try {
//     const id = req.params.id;

//     const transaksi_medis = await TransaksiMedis.findByPk(id, {
//       include: [
//         {
//           model: Pasien,
//           attributes: [
//             "nama",
//             "jk",
//             "no_telp",
//             "alergi",
//             "tgl_lahir",
//             "gol_darah",
//             "alamat",
//           ],
//         },
//         {
//           model: Dokter,
//           attributes: [
//             "nama_dokter",
//             "mulai_praktik",
//             "selesai_praktik",
//             "hari_praktik",
//             "spesialis_dokter_id",
//             "urlGambar",
//           ],
//         },
//       ],
//       attributes: {
//         exclude: ["createdAt", "updatedAt"],
//       },
//     });

//     if (!transaksi_medis) {
//       return res.status(404).send({
//         message: `Cannot find transaksi_medis with id=${id}.`,
//       });
//     }

//     // Find Dokter by pasien_id
//     const dokter = await Dokter.findByPk(req.body.pasien_id);
//     if (!dokter) {
//       return res.status(404).send({ message: "Dokter not found!" });
//     }

//     // Find Pasien by dokter_id
//     const pasien = await Pasien.findByPk(req.body.dokter_id);
//     if (!pasien) {
//       return res.status(404).send({ message: "Pasien not found!" });
//     }

//     res.send(transaksi_medis);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       message: `Error retrieving transaksi_medis with id=${id}`,
//     });
//   }
// };
// find by pasien id
exports.findOneAll = async (req, res) => {
  try {
    const pasienId = req.params.id;

    const transaksi_medis = await TransaksiMedis.findAll({
      where: { pasien_id: pasienId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Pasien,
          attributes: [
            "nama",
            "jk",
            "no_telp",
            "alergi",
            "tgl_lahir",
            "gol_darah",
            "alamat",
          ],
        },
        {
          model: Dokter,
          attributes: [
            "nama_dokter",
            "mulai_praktik",
            "selesai_praktik",
            "hari_praktik",
            "spesialis_dokter_id",
            "urlGambar",
          ],
        },
      ],
      attributes: {
        exclude: ["updatedAt"],
      },
    });

    if (!transaksi_medis) {
      return res.status(404).send({
        message: `Cannot find transaksi_medis with pasien_id=${pasienId}.`,
      });
    }

    res.send(transaksi_medis);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving transaksi_medis with pasien_id=${pasienId}`,
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const pasienId = req.params.id;

    const transaksi_medis = await TransaksiMedis.findOne({
      where: { pasien_id: pasienId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Pasien,
          attributes: [
            "nama",
            "jk",
            "no_telp",
            "alergi",
            "tgl_lahir",
            "gol_darah",
            "alamat",
          ],
        },
        {
          model: Dokter,
          attributes: [
            "nama_dokter",
            "mulai_praktik",
            "selesai_praktik",
            "hari_praktik",
            "spesialis_dokter_id",
            "urlGambar",
          ],
        },
      ],
      attributes: {
        exclude: ["updatedAt"],
      },
    });

    if (!transaksi_medis) {
      return res.status(404).send({
        message: `Cannot find transaksi_medis with pasien_id=${pasienId}.`,
      });
    }

    res.send(transaksi_medis);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving transaksi_medis with pasien_id=${pasienId}`,
    });
  }
};

// Update a transaksi_medis by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    // Retrieve the existing transaction data with associated dokter and pasien
    const existingTransaksiMedis = await TransaksiMedis.findByPk(id, {
      include: [Dokter, Pasien],
    });
    if (!existingTransaksiMedis) {
      return res.status(404).send({
        message: `Transaksi medis with id=${id} not found.`,
      });
    }

    // Update the transaction data in the database
    await TransaksiMedis.update(req.body, {
      where: { id: id },
    });

    // Prepare the data for the pasien and dokter in the QR code content
    // Find Dokter by dokter_id
    const dokter = await Dokter.findByPk(req.body.dokter_id);
    if (!dokter) {
      return res.status(404).send({ message: "Dokter not found!" });
    }

    // Find Pasien by pasien_id
    const pasien = await Pasien.findByPk(req.body.pasien_id);
    if (!pasien) {
      return res.status(404).send({ message: "Pasien not found!" });
    }
    if (existingTransaksiMedis.Pasien) {
      pasien = existingTransaksiMedis.Pasien.toJSON();
    }
    if (existingTransaksiMedis.Dokter) {
      dokter = existingTransaksiMedis.Dokter.toJSON();
    }

    // Generate a new UUID-based filename for the QR code image
    const filename = `${uuidv4()}.png`;

    // Path untuk menyimpan gambar QR code di dalam direktori public
    const qrCodePath = path.join(
      __dirname,
      `../../public/assets/images/qrcode/${filename}`
    );

    // Create transaksi_medis object for QR code content
    const transaksi_medis = {
      pasien_id: existingTransaksiMedis.pasien_id,
      dokter_id: existingTransaksiMedis.dokter_id,
      pasien: pasien,
      dokter: dokter,
      keluhan: existingTransaksiMedis.keluhan,
    };

    // Generate QR code and save it as a file
    qr.toFile(qrCodePath, JSON.stringify(transaksi_medis), async (err) => {
      if (err) {
        console.error("Error generating QR code:", err);
        return res.status(500).send({ message: "Error generating QR code." });
      }

      // Generate URL for the QR code image
      const qrCodeUrl = `${req.protocol}://${req.get(
        "host"
      )}/qrcode/${filename}`;

      // Update the QR code URL and filename in the database
      await TransaksiMedis.update(
        { url_qrcode: qrCodeUrl, filename: filename },
        { where: { id: id } }
      );

      // Send the response with updated transaction data and associated dokter and pasien
      res.send({
        message: "Transaksi medis and QR code were updated successfully.",
        transaksi_medis: {
          ...existingTransaksiMedis.toJSON(),
          url_qrcode: qrCodeUrl,
          keluhan: existingTransaksiMedis.keluhan,
        },
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error updating transaksi_medis with id=" + id,
    });
  }
};

// Delete a transaksi_medis with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  TransaksiMedis.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "transaksi_medis was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete transaksi_medis with id=${id}. Maybe transaksi_medis was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete transaksi_medis with id=" + id,
      });
    });
};

// Delete all transaksi_mediss from the database.
exports.deleteAll = (req, res) => {
  TransaksiMedis.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} transaksi_mediss were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all transaksi_mediss.",
      });
    });
};
