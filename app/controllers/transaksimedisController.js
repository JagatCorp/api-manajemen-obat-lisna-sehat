const db = require("../models");
const TransaksiMedis = db.transaksi_medis;
const SpesialisDokter = db.spesialisdokter;
const TransaksiObatKeluar = db.transaksi_obat_keluar;
const Dokter = db.dokter;
const Pasien = db.pasien;
const qr = require("qrcode");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op, fn, col } = require("sequelize");
const transaksimedis = require("../routes/transaksimedis");

// Create and Save a new transaksi_medis
// exports.create = async (req, res) => {
//   try {
//     // Validate request
//     // if (!req.body.pasien_id || !req.body.dokter_id) {
//     //   return res.status(400).send({ message: "Data is required!" });
//     // }

//     // Find Dokter by dokter_id
//     const dokter = await Dokter.findByPk(req.body.dokter_id);
//     if (!dokter) {
//       return res.status(404).send({ message: "Dokter not found!" });
//     }

//     const spesialis_dokter = await SpesialisDokter.findByPk(
//       dokter.spesialis_dokter_id
//     );
//     if (!spesialis_dokter) {
//       return res.status(404).send({ message: "Spesialis Dokter not found!" });
//     }

//     dokter["spesialis_dokter"] = spesialis_dokter;

//     // Find Pasien by pasien_id
//     const pasien = await Pasien.findByPk(req.body.pasien_id);
//     if (!pasien) {
//       return res.status(404).send({ message: "Pasien not found!" });
//     }

//     // Generate a unique filename for the QR code image using uuid
//     const filename = `${uuidv4()}.png`;

//     // Path untuk menyimpan gambar QR code di dalam direktori public
//     const qrCodePath = path.join(
//       __dirname,
//       `../../public/assets/images/qrcode/${filename}`
//     );

//     // Create transaksi_medis object
//     const transaksi_medis = {
//       pasien_id: req.body.pasien_id,
//       dokter_id: req.body.dokter_id,
//       pasien: pasien.toJSON(),
//       dokter: dokter.toJSON(),
//       keluhan: req.body.keluhan,
//       harga: req.body.harga,
//     };

//     // Generate QR code and save it as a file
//     qr.toFile(qrCodePath, JSON.stringify(transaksi_medis), async (err) => {
//       if (err) {
//         console.error("Error generating QR code:", err);
//         return res.status(500).send({ message: "Error generating QR code." });
//       }

//       // Generate URL for the QR code image local
//       const qrCodeUrl = `${req.protocol}://${req.get(
//         "host"
//       )}/qrcode/${filename}`;
//       // production
//       // const qrCodeUrl = `https://api.lisnasehat.online/qrcode/${filename}`;

//       // Add QR code URL to the transaksi_medis object
//       transaksi_medis.url_qrcode = qrCodeUrl;

//       // Create the transaction record with QR code URL
//       const createdTransaksiMedis = await TransaksiMedis.create(
//         transaksi_medis
//       );

//       // Send the response with the QR code URL and associated data
//       res.send({
//         pasien_id: transaksi_medis.pasien_id,
//         dokter_id: transaksi_medis.dokter_id,
//         pasien: transaksi_medis.pasien,
//         dokter: transaksi_medis.dokter,
//         keluhan: transaksi_medis.keluhan,
//         harga: transaksi_medis.harga,
//         qrCodeUrl: qrCodeUrl,
//       });
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .send({ message: error.message || "Error creating transaksi_medis." });
//   }
// };

exports.create = async (req, res) => {
  try {
    // Validate request
    // if (!req.body.pasien_id || !req.body.dokter_id) {
    //   return res.status(400).send({ message: "Data is required!" });
    // }

    // Find Dokter by dokter_id including its associated SpesialisDokter
    const dokter = await Dokter.findByPk(req.body.dokter_id, {
      include: SpesialisDokter,
    });
    if (!dokter) {
      return res.status(404).send({ message: "Dokter not found!" });
    }

    // Check if spesialis dokter is available
    let spesialisDokterInfo = {};
    if (dokter.spesialisDokter) {
      spesialisDokterInfo = dokter.spesialisDokter.toJSON();
    }

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
      spesialis_dokter: spesialisDokterInfo, // Include spesialis dokter info
      keluhan: req.body.keluhan,
      harga: req.body.harga,
      diagnosa_dokter: req.body.diagnosa_dokter,
    };

    // generate nomor urut antrian
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    const cekTransaksiMedis = await TransaksiMedis.findAll({
      where: {
        createdAt: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay,
        },
        dokter_id: req.body.dokter_id,
      },
    });

    if (cekTransaksiMedis.length == 0) {
      transaksi_medis.no_urut = 1;
    } else {
      transaksi_medis.no_urut = ++cekTransaksiMedis.length;
    }

    if (req.body.status) {
      transaksi_medis.status = req.body.status;
    } else {
      transaksi_medis.status = 0;
    }

    // return res.status(500).send({ message: transaksi_medis.no_urut });

    // Generate QR code and save it as a file
    qr.toFile(qrCodePath, JSON.stringify(transaksi_medis), async (err) => {
      if (err) {
        console.error("Error generating QR code:", err);
        return res.status(500).send({ message: "Error generating QR code." });
      }

      // Generate URL for the QR code image local
      const qrCodeUrl = `${req.protocol}://${req.get(
        "host"
      )}/qrcode/${filename}`;
      // production
      // const qrCodeUrl = `https://api.lisnasehat.online/qrcode/${filename}`;

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
        spesialis_dokter: transaksi_medis.spesialis_dokter, // Include spesialis dokter info
        keluhan: transaksi_medis.keluhan,
        harga: transaksi_medis.harga,
        diagnosa_dokter: transaksi_medis.diagnosa_dokter,
        status: transaksi_medis.status,
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

// export


exports.export = async (req, res) => {
  try {
    // Query untuk mendapatkan semua data tanpa pagination dan search
    const searchQuery = {
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
          include: [
            {
              model: SpesialisDokter,
              attributes: ["nama_spesialis", "harga", "is_dokter_gigi"],
            },
          ],
        },
      ],
      attributes: {
        exclude: ["updatedAt"],
      },
    };

     var jumlahhargaTotal = 0;    
    // Mengambil semua transaksi medis
    const transaksi_medis = await TransaksiMedis.findAll(searchQuery);
    const transaksiMedisWithObatKeluarCount = await Promise.all(transaksi_medis.map(async (transaksiMedis, index) => {
      
      const transaksiObatKeluar = await TransaksiObatKeluar.findAll({
        where: {
          transaksi_medis_id: transaksiMedis.id
        }
      });

      jumlahhargaTotal += transaksiMedis.harga_total;

      return {
        no: ++index,
        'Nama Pasien': transaksiMedis.pasien.nama,
        'Jenis Kelamin': transaksiMedis.pasien.jk === 'L' ? 'Laki-laki' : 'Perempuan',
        'Harga Total': transaksiMedis.harga_total,
        'Nama Dokter': transaksiMedis.dokter.nama_dokter,
        'Spesialis Dokter': transaksiMedis.dokter.spesialisdokter.nama_spesialis,
        'Nama Obat': transaksiMedis.obat,
        'Jumlah Jenis Obat DiBeli': transaksiObatKeluar.length,
        // ...transaksiMedis.toJSON(),

      };
    }))


    // Kirim response dengan data JSON
    res.send({
      data: transaksiMedisWithObatKeluarCount,
      jumlahhargaTotal: jumlahhargaTotal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving transaksi_mediss." });
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
          include: [
            {
              model: SpesialisDokter,
              attributes: ["nama_spesialis", "harga", "is_dokter_gigi"],
            },
          ],
        },
      ],
      attributes: {
        exclude: ["updatedAt"],
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

exports.findAllPasien = async (req, res) => {
  try {
    // Mendapatkan nilai halaman dan ukuran halaman dari query string (default ke halaman 1 dan ukuran 10 jika tidak disediakan)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Menghitung offset berdasarkan halaman dan ukuran halaman
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";

    // Mendapatkan pasien_id dari parameter URL
    const pasienId = req.params.id;

    // Query pencarian
    const searchQuery = {
      where: {
        pasien_id: pasienId,
        // [Op.or]: [
        //   { '$keluhan$': { [Op.like]: `%${keyword}%` } },
        //   { '$Pasien.alamat$': { [Op.like]: `%${keyword}%` } }
        // ],
      },
      order: [["createdAt", "DESC"]],
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
        exclude: ["updatedAt"],
      },
    };

    const transaksi_medis = await TransaksiMedis.findAll(searchQuery);
    const totalCount = await TransaksiMedis.count({
      where: searchQuery.where,
    });

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

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
    res.status(500).send({ message: "Error retrieving transaksi_medis." });
  }
};

exports.findAllDokter = async (req, res) => {
  try {
    // Mendapatkan nilai halaman dan ukuran halaman dari query string (default ke halaman 1 dan ukuran 10 jika tidak disediakan)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Menghitung offset berdasarkan halaman dan ukuran halaman
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";

    // Mendapatkan pasien_id dari parameter URL
    const dokterId = req.params.id;

    // Query pencarian
    const searchQuery = {
      where: {
        dokter_id: dokterId,
        // [Op.or]: [
        //   { '$Pasien.nama$': { [Op.like]: `%${keyword}%` } },
        //   { '$Pasien.alamat$': { [Op.like]: `%${keyword}%` } }
        // ],
      },
      order: [["createdAt", "DESC"]],
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
        exclude: ["updatedAt"],
      },
    };

    const transaksi_medis = await TransaksiMedis.findAll(searchQuery);
    const totalCount = await TransaksiMedis.count({
      where: searchQuery.where,
    });

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

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
    res.status(500).send({ message: "Error retrieving transaksi_medis." });
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
// exports.findOneAll = async (req, res) => {
//   try {
//     const pasienId = req.params.id;

//     const transaksi_medis = await TransaksiMedis.findAll({
//       where: { pasien_id: pasienId },
//       order: [["createdAt", "DESC"]],
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
//         exclude: ["updatedAt"],
//       },
//     });

//     if (!transaksi_medis) {
//       return res.status(404).send({
//         message: `Cannot find transaksi_medis with pasien_id=${pasienId}.`,
//       });
//     }

//     res.send(transaksi_medis);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       message: `Error retrieving transaksi_medis with pasien_id=${pasienId}`,
//     });
//   }
// };

exports.findOneAll = async (req, res) => {
  try {
    const pasienId = req.params.id;
    const keyword = req.query.keyword || "";
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * pageSize;

    const whereClause = {
      pasien_id: pasienId,
      keluhan: {
        [Op.like]: `%${keyword}%`,
      },
    };

    const { count, rows } = await TransaksiMedis.findAndCountAll({
      where: whereClause,
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
      limit: pageSize,
      offset: offset,
    });

    if (rows.length === 0) {
      return res.status(404).send({
        message: `Cannot find transaksi_medis with pasien_id=${pasienId}.`,
      });
    }

    const totalPages = Math.ceil(count / pageSize);

    res.send({
      data: rows,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving transaksi_medis with pasien_id=${pasienId}`,
    });
  }
};
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    const transaksi_medis = await TransaksiMedis.findOne({
      where: { id: id },
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
            "jk",
            "mulai_praktik",
            "selesai_praktik",
            "hari_praktik",
            "spesialis_dokter_id",
            "urlGambar",
          ],
          include: [
            {
              model: SpesialisDokter,
              attributes: ["nama_spesialis", "harga", "is_dokter_gigi"],
            },
          ],
        },
      ],
      attributes: {
        exclude: ["updatedAt"],
      },
    });

    if (!transaksi_medis) {
      return res.status(404).send({
        message: `Cannot find transaksi_medis with pasien_id=${id}.`,
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

exports.findDokterBerobat = async (req, res) => {
  try {
    const id = req.params.id;

    const transaksi_medis = await TransaksiMedis.findOne({
      where: { dokter_id: id, status: '2' },
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
            "jk",
            "mulai_praktik",
            "selesai_praktik",
            "hari_praktik",
            "spesialis_dokter_id",
            "urlGambar",
          ],
          include: [
            {
              model: SpesialisDokter,
              attributes: ["nama_spesialis", "harga", "is_dokter_gigi"],
            },
          ],
        },
      ],
      attributes: {
        exclude: ["updatedAt"],
      },
    });

    if (!transaksi_medis) {
      return res.status(404).send({
        message: `Cannot find transaksi_medis with pasien_id=${id}.`,
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
// exports.update = async (req, res) => {
//   const id = req.params.id;

//   try {
//     // Retrieve the existing transaction data with associated dokter and pasien
//     const existingTransaksiMedis = await TransaksiMedis.findByPk(id, {
//       include: [Dokter, Pasien],
//     });
//     if (!existingTransaksiMedis) {
//       return res.status(404).send({
//         message: `Transaksi medis with id=${id} not found.`,
//       });
//     }

//     // Update the transaction data in the database
//     await TransaksiMedis.update(req.body, {
//       where: { id: id },
//     });

//     // Prepare the data for the pasien and dokter in the QR code content
//     // Find Dokter by dokter_id
//     const dokter = await Dokter.findByPk(req.body.dokter_id);
//     if (!dokter) {
//       return res.status(404).send({ message: "Dokter not found!" });
//     }

//     // Find Pasien by pasien_id
//     const pasien = await Pasien.findByPk(req.body.pasien_id);
//     if (!pasien) {
//       return res.status(404).send({ message: "Pasien not found!" });
//     }
//     if (existingTransaksiMedis.Pasien) {
//       pasien = existingTransaksiMedis.Pasien.toJSON();
//     }
//     if (existingTransaksiMedis.Dokter) {
//       dokter = existingTransaksiMedis.Dokter.toJSON();
//     }

//     // Generate a new UUID-based filename for the QR code image
//     const filename = `${uuidv4()}.png`;

//     // Path untuk menyimpan gambar QR code di dalam direktori public
//     const qrCodePath = path.join(
//       __dirname,
//       `../../public/assets/images/qrcode/${filename}`
//     );

//     // Create transaksi_medis object for QR code content
//     const transaksi_medis = {
//       pasien_id: existingTransaksiMedis.pasien_id,
//       dokter_id: existingTransaksiMedis.dokter_id,
//       pasien: pasien,
//       dokter: dokter,
//       keluhan: existingTransaksiMedis.keluhan,
//       harga: existingTransaksiMedis.harga,
//       status: existingTransaksiMedis.status,
//     };

//     // Generate QR code and save it as a file
//     qr.toFile(qrCodePath, JSON.stringify(transaksi_medis), async (err) => {
//       if (err) {
//         console.error("Error generating QR code:", err);
//         return res.status(500).send({ message: "Error generating QR code." });
//       }

//       // Generate URL for the QR code image local
//       const qrCodeUrl = `${req.protocol}://${req.get(
//         "host"
//       )}/qrcode/${filename}`;

//       // production
//       // const qrCodeUrl = `https://api.lisnasehat.online/qrcode/${filename}`;

//       // Update the QR code URL and filename in the database
//       await TransaksiMedis.update(
//         { url_qrcode: qrCodeUrl, filename: filename },
//         { where: { id: id } }
//       );

//       // Send the response with updated transaction data and associated dokter and pasien
//       res.send({
//         message: "Transaksi medis and QR code were updated successfully.",
//         transaksi_medis: {
//           ...existingTransaksiMedis.toJSON(),
//           url_qrcode: qrCodeUrl,
//           keluhan: existingTransaksiMedis.keluhan,
//           harga: existingTransaksiMedis.harga,
//           status: existingTransaksiMedis.status,
//         },
//       });
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       message: "Error updating transaksi_medis with id=" + id,
//     });
//   }
// };

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

    // Check if spesialis dokter is available
    let spesialisDokterInfo = {};
    if (dokter.spesialisDokter) {
      spesialisDokterInfo = dokter.spesialisDokter.toJSON();
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
      spesialis_dokter: spesialisDokterInfo, // Include spesialis dokter info
      keluhan: existingTransaksiMedis.keluhan,
      harga: existingTransaksiMedis.harga,
      diagnosa_dokter: existingTransaksiMedis.diagnosa_dokter,
      status: existingTransaksiMedis.status,
    };

    // Generate QR code and save it as a file
    qr.toFile(qrCodePath, JSON.stringify(transaksi_medis), async (err) => {
      if (err) {
        console.error("Error generating QR code:", err);
        return res.status(500).send({ message: "Error generating QR code." });
      }

      // Generate URL for the QR code image local
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
          spesialis_dokter: spesialisDokterInfo, // Include spesialis dokter info
          keluhan: existingTransaksiMedis.keluhan,
          harga: existingTransaksiMedis.harga,
          diagnosa_dokter: existingTransaksiMedis.diagnosa_dokter,
          status: existingTransaksiMedis.status,
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

exports.updateSelesai = async (req, res) => {
  const id = req.params.id;

  try {
    const existingTransaksiMedis = await TransaksiMedis.findByPk(id, {
      include: [Dokter, Pasien],
    });

    if (!existingTransaksiMedis) {
      return res
        .status(404)
        .send({ message: `Transaksi medis with id=${id} not found.` });
    }

    await existingTransaksiMedis.update(req.body, {
      where: { id: id },
    });

    res.send({ message: "Transaksi medis was updated successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({
        message: `Error updating transaksi_medis with id=${id}: ${error.message}`,
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
