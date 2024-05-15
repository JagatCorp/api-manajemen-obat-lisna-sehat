const db = require("../models");
const TransaksiObatMasuk = db.transaksi_obat_masuk;
const Principle = db.principle;
const Obat = db.obat;

// const Op = db.Sequelize.Op;
// const { Op } = require("sequelize");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");

// Create and Save a new transaksi_obat_masuk
exports.create = async (req, res) => {
  try {
    // Validate request
    if (
      // !req.body.stok_obat_sebelum ||
      // !req.body.stok_obat_sesudah ||
      !req.body.principle_id ||
      !req.body.obat_id ||
      !req.body.jml_obat ||
      !req.body.harga
    ) {
      return res.status(400).send({ message: "Data is required!" });
    }
    
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
    const stok_obat_sesudah = obat.stok + req.body.jml_obat;
    const stok_obat_sebelum = obat.stok;

    // Create transaksi_obat_masuk object with layanan_id
    const transaksi_obat_masuk = {
      stok_obat_sebelum: stok_obat_sebelum,
      stok_obat_sesudah: stok_obat_sesudah,
      principle_id: req.body.principle_id,
      obat_id: req.body.obat_id,
      jml_obat: req.body.jml_obat,
      harga: req.body.harga
    };

    if(req.body.createdAt != ''){
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
    
    // Find Principle by principle_id
    const principle = await Principle.findByPk(req.body.principle_id);
    if (!principle) {
      return res.status(404).send({ message: "Principle not found!" });
    }

    // Find Obat by obat_id
    const obat = await Obat.findByPk(req.body.obat_id);
    if (!obat) {
      return res.status(404).send({ message: "Obat not found!" });
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

  TransaksiObatMasuk.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "transaksi_obat_masuk was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update transaksi_obat_masuk with id=${id}. Maybe transaksi_obat_masuk was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating transaksi_obat_masuk with id=" + id,
      });
    });
};

// Delete a transaksi_obat_masuk with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  TransaksiObatMasuk.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "transaksi_obat_masuk was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete transaksi_obat_masuk with id=${id}. Maybe transaksi_obat_masuk was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete transaksi_obat_masuk with id=" + id,
      });
    });
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
