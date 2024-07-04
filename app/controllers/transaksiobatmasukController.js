const db = require("../models");
const TransaksiObatMasuk = db.transaksi_obat_masuk;
const Principle = db.principle;
const Obat = db.obat;

// const Op = db.Sequelize.Op;
// const { Op } = require("sequelize");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");
const moment = require("moment");
const fs = require('fs');
const path = require('path');
// Create and Save a new transaksi_obat_masuk
exports.create = async (req, res) => {
  try {
    // Validate request
    if (
      // !req.body.stok_obat_sebelum ||
      // !req.body.stok_obat_sesudah ||
      // !req.body.principle_id ||
      // !req.body.obat_id ||
      // !req.body.jml_obat ||
      // !req.body.harga ||
      !req.body.disc_principle
    ) {
      return res.status(400).send({ message: "Data is required!" });
    }

    // Proses file gambar yang diunggah
    const imageName = req.file.filename;
    // // local
     const imageUrl = `${req.protocol}://${req.get("host")}/nota/${imageName}`;
    // production 
    // const imageUrl = `https://api.lisnasehat.online/nota/${imageName}`;
    // Find Principle by principle_id
    const principle = await Principle.findByPk(req.body.principle_id);
    if (!principle) {
      return res.status(404).send({ message: "Principle not found!" });
    }
    // return res.status(404).send({ message: req.body.createdAt == '' });

    // Find Obat by obat_id
    const obat = await Obat.findByPk(req.body.obat_id);
    if (!obat) {
      return res.status(404).send({ message: "Obat not found!" });
    }

    const stok_obat_sebelum = obat.stok;
    const stok_obat_sesudah = parseInt(obat.stok) + parseInt(req.body.jml_obat);

    obat.update({ stok: stok_obat_sesudah, harga: req.body.harga, disc_principle: req.body.disc_principle });


    // Create transaksi_obat_masuk object with layanan_id
    const transaksi_obat_masuk = {
      stok_obat_sebelum: stok_obat_sebelum,
      stok_obat_sesudah: stok_obat_sesudah,
      principle_id: req.body.principle_id,
      obat_id: req.body.obat_id,
      jml_obat: req.body.jml_obat,
      disc_principle: req.body.disc_principle,
      harga: req.body.harga,
      jatuh_tempo: req.body.jatuh_tempo,
      expired: req.body.expired,
      gambar_nota: imageName,
      urlGambar: imageUrl,
    };

    if (req.body.createdAt != '') {
      transaksi_obat_masuk['createdAt'] = req.body.createdAt;
    }

    // Save transaksi_obat_masuk to the database
    const createdTransaksiObatMasuk = await TransaksiObatMasuk.create(transaksi_obat_masuk);
    res.send(createdTransaksiObatMasuk);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message || "Error creating transaksi_obat_masuk." });
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
          model: Obat,
          attributes: ["nama_obat"],
        },
        {
          model: Principle,
          attributes: ["nama_instansi"],
        },
      ],
      attributes: {
        exclude: [
          // "createdAt", 
          "updatedAt"
        ],
      },
    };

    const transaksi_obat_masuk = await TransaksiObatMasuk.findAll(searchQuery);
    const totalCount = await TransaksiObatMasuk.count(searchQuery);
    // Menghitung total jumlah transaksi_obat_masuk
    // const totalCount = await TransaksiObatMasuk.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    // const transaksi_obat_masukData = transaksi_obat_masukSerializer.serialize(transaksi_obat_masuk);

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: transaksi_obat_masuk,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving transaksi_obat_masuks." });
  }
};

// hari ini
exports.findAllHariini = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";

    const startOfToday = moment().startOf('day').toDate();
    const endOfToday = moment().endOf('day').toDate();

    const searchQuery = {
      where: {
        createdAt: {
          [Op.gte]: startOfToday,
          [Op.lt]: endOfToday
        },
        // Uncomment this block if you want to add keyword searching
        // [Op.or]: [
        //   { nama: { [Op.like]: `%${keyword}%` } },
        // ],
      },
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Obat,
          attributes: ["nama_obat", "urlGambar"],
        },
        {
          model: Principle,
          attributes: ["nama_instansi"],
        },
      ],
      attributes: {
        exclude: [
          // "createdAt",
          "updatedAt"
        ],
      },
    };

    const transaksi_obat_masuk = await TransaksiObatMasuk.findAll(searchQuery);
    const totalCount = await TransaksiObatMasuk.count({
      where: {
        createdAt: {
          [Op.gte]: startOfToday,
          [Op.lt]: endOfToday
        },
      }
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.send({
      data: transaksi_obat_masuk,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving transaksi_obat_masuks." });
  }
};

// jatuh tempo


exports.findAllJatuhTempo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";

    const searchQuery = {
      where: {
        // Menambahkan pencarian berdasarkan keyword jika diperlukan
        ...(keyword && {
          [Op.or]: [
            { '$Obat.nama_obat$': { [Op.like]: `%${keyword}%` } },
            { '$Principle.nama_instansi$': { [Op.like]: `%${keyword}%` } }
          ]
        })
      },
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Obat,
          attributes: ["nama_obat", "urlGambar"],
        },
        {
          model: Principle,
          attributes: ["nama_instansi"],
        },
      ],
      attributes: {
        exclude: [
          // "createdAt",
          "updatedAt"
        ],
      },
      order: [
        ['jatuh_tempo', 'DESC']
      ]
    };

    const transaksi_obat_masuk = await TransaksiObatMasuk.findAll(searchQuery);
    const totalCount = await TransaksiObatMasuk.count({
      where: {
        ...(keyword && {
          [Op.or]: [
            { '$Obat.nama_obat$': { [Op.like]: `%${keyword}%` } },
            { '$Principle.nama_instansi$': { [Op.like]: `%${keyword}%` } }
          ]
        })
      }
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.send({
      data: transaksi_obat_masuk,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving transaksi_obat_masuks." });
  }
};

exports.findAllDelete = async (req, res) => {
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
      // where: { deletedAt: { [Sequelize.Op.not]: null } },
      where: {
        deletedAt: {
          [Op.not]: null
        }
      },
      paranoid: false,
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Obat,
          attributes: ["nama_obat"],
        },
        {
          model: Principle,
          attributes: ["nama_instansi"],
        },
      ],
      attributes: {
        exclude: [
          // "createdAt", 
          "updatedAt"
        ],
      },
    };

    const transaksi_obat_masuk = await TransaksiObatMasuk.findAll(searchQuery);
    const totalCount = await TransaksiObatMasuk.count(searchQuery);
    // Menghitung total jumlah transaksi_obat_masuk
    // const totalCount = await TransaksiObatMasuk.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    // const transaksi_obat_masukData = transaksi_obat_masukSerializer.serialize(transaksi_obat_masuk);

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: transaksi_obat_masuk,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving transaksi_obat_masuks." });
  }
};

// Find a single admin with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    const transaksi_obat_masuk = await TransaksiObatMasuk.findByPk(id, {
      include: [
        {
          model: Obat,
          attributes: ["nama_obat"],
        },
        {
          model: Principle,
          attributes: ["nama_instansi"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!transaksi_obat_masuk) {
      return res.status(404).send({
        message: `Cannot find transaksi_obat_masuk with id=${id}.`,
      });
    }

    res.send(transaksi_obat_masuk);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving transaksi_obat_masuk with id=${id}`,
    });
  }
};


// Update a transaksi_obat_masuk by the id in the request

exports.update = async (req, res) => {
  const id = req.params.id;
  const file = req.file;

  try {
    let TransaksiObatMasukData = req.body;

    // Temukan obat yang akan diupdate
    const transaksi_obat_masuk = await TransaksiObatMasuk.findByPk(id);

    if (!transaksi_obat_masuk) {
      return res.status(404).send({ message: `TransaksiObatMasuk dengan id=${id} tidak ditemukan` });
    }

    if (file) {
      const imageName = file.filename;
      // local
      const imageUrl = `${req.protocol}://${req.get("host")}/nota/${file.filename}`;
      // production
      // const imageUrl = `https://api.lisnasehat.online/nota/${file.filename}`;

      TransaksiObatMasukData = {
        ...TransaksiObatMasukData,
        gambar_nota: imageName,
        urlGambar: imageUrl,
      };

      const filePath = path.join(__dirname, '../../public/assets/images/nota/', transaksi_obat_masuk.gambar_nota);

      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted the file under ${filePath}`);
      } catch (err) {
        console.log("An error occurred: ", err.message);
      }
    } else {
      TransaksiObatMasukData = {
        ...TransaksiObatMasukData,
        gambar_nota: transaksi_obat_masuk.gambar_nota,
        urlGambar: transaksi_obat_masuk.urlGambar,
      };
    }

    // Perbarui data transaksi_obat_masuk dengan data baru, termasuk data yang tidak berubah
    await transaksi_obat_masuk.update(TransaksiObatMasukData);

    res.send({
      message: "TransaksiObatMasuk berhasil diubah.",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.restore = async (req, res) => {
  const id = req.params.id;

  try {
    const transaksi_obat_masuk = await TransaksiObatMasuk.findByPk(id, {
      paranoid: false
    })

    const obat = await Obat.findByPk(transaksi_obat_masuk.obat_id);

    const stokBaru = obat.stok + transaksi_obat_masuk.jml_obat;
    await obat.update({ stok: stokBaru });

    await transaksi_obat_masuk.restore();

    if (transaksi_obat_masuk == 1) {
      res.send({
        message: "TransaksiObatMasuk was restored successfully."
      });
    } else {
      res.send({
        message: `Cannot restore TransaksiObatMasuk with id=${id}. Maybe TransaksiObatMasuk was not found or it was not soft deleted!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error restoring TransaksiObatMasuk with id=" + id
    });
  }
};

// Delete a transaksi_obat_masuk with the specified id in the request

exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const transaksi_obat_masuk = await TransaksiObatMasuk.findByPk(id);

    if (!transaksi_obat_masuk) {
      return res.status(404).send({ message: `TransaksiObatMasuk dengan id=${id} tidak ditemukan` });
    }

    const filePath = path.join(__dirname, '../../public/assets/images/nota/', transaksi_obat_masuk.gambar_nota);

    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted the file under ${filePath}`);
    } catch (err) {
      console.log("An error occurred: ", err.message);
    }

    await TransaksiObatMasuk.destroy({
      where: { id: id },
    });

    res.send({
      message: "TransaksiObatMasuk berhasil dihapus.",
    });
  } catch (error) {
    res.status(500).send({
      message: "Could not delete TransaksiObatMasuk with id=" + id,
    });
  }
};

// Delete all transaksi_obat_masuks from the database.
exports.deleteAll = (req, res) => {
  TransaksiObatMasuk.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} transaksi_obat_masuks were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all transaksi_obat_masuks.",
      });
    });
};

exports.hardDelete = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await TransaksiObatMasuk.destroy({
      where: { id: id },
      force: true  // Menghapus permanen
    });

    if (result == 1) {
      res.send({
        message: "TransaksiObatMasuk was deleted permanently."
      });
    } else {
      res.send({
        message: `Cannot delete TransaksiObatMasuk with id=${id}. Maybe TransaksiObatMasuk was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error deleting TransaksiObatMasuk with id=" + id
    });
  }
};