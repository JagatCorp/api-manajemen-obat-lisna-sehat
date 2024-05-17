const db = require("../models");
const TransaksiObatKeluar = db.transaksi_obat_keluar;
const Obat = db.obat;

// const Op = db.Sequelize.Op;
// const { Op } = require("sequelize");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");

// Create and Save a new transaksi_obat_keluar
exports.create = async (req, res) => {
  try {
    // Validate request
    if (
      !req.body.transaksi_obat_keluar_id ||
      !req.body.obat_id ||
      !req.body.pasien_id ||
      !req.body.jml_obat ||
      !req.body.harga
    ) {
      return res.status(400).send({ message: "Data is required!" });
    }

    // Find Obat by obat_id
    const obat = await Obat.findByPk(req.body.obat_id);
    if (!obat) {
      return res.status(404).send({ message: "Obat not found!" });
    }

    const stok_obat_sebelum = obat.stok;
    const stok_obat_sesudah = parseInt(obat.stok) + parseInt(req.body.jml_obat);

    obat.update({ stok: stok_obat_sesudah });

    // Create transaksi_obat_keluar object with layanan_id
    const transaksi_obat_keluar = {
      stok_obat_sebelum: stok_obat_sebelum,
      stok_obat_sesudah: stok_obat_sesudah,
      transaksi_obat_keluar_id: req.body.transaksi_obat_keluar_id,
      obat_id: req.body.obat_id,
      pasien_id: req.body.pasien_id,
      jml_obat: req.body.jml_obat,
      harga: req.body.harga
    };

    // Save transaksi_obat_keluar to the database
    const createdTransaksiObatKeluar = await TransaksiObatKeluar.create(transaksi_obat_keluar);
    res.send(createdTransaksiObatKeluar);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message || "Error creating transaksi obat keluar." });
  }
};

const obatKeluarSerializer = new JSONAPISerializer('transaksi_obat_keluar', {
  attributes: ['stok_obat_sebelum', 'stok_obat_sesudah', 'obat_id', 'pasien_id', 'jml_obat', 'harga'],
  keyForAttribute: 'underscore_case',
});

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
      // where: {
      //   [Op.or]: [
      //     { nama: { [Op.like]: `%${keyword}%` } },
      //   ],
      // },
      limit: pageSize,
      offset: offset,
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    };

    const transaksi_obat_keluar = await TransaksiObatKeluar.findAll(searchQuery);
    const totalCount = await TransaksiObatKeluar.count(searchQuery);
    // Menghitung total jumlah transaksi_obat_keluar
    // const totalCount = await TransaksiObatKeluar.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    const obatKeluarData = obatKeluarSerializer.serialize(transaksi_obat_keluar);
    
    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: obatKeluarData,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving transaksi obat keluar." });
  }
};

// Find a single admin with an id

exports.findOne = async (req, res) => {
  const id = req.params.id;
  
  try {
    const transaksi_obat_keluar = await TransaksiObatKeluar.findByPk(id);
    
    if (!transaksi_obat_keluar) {
      return res.status(404).send({
        message: `Cannot find transaksi obat keluar with id=${id}.`,
      });
    }

    const serializedTransaksiObatKeluar = obatKeluarSerializer.serialize(transaksi_obat_keluar);
    
    res.send(serializedTransaksiObatKeluar);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving transaksi obat keluar with id=${id}`,
    });
  }
};

exports.findOneAll = async (req, res) => {
  const id = req.params.id;
  
  try {
    const transaksi_obat_keluar = await TransaksiObatKeluar.findAll({
      where: {
        transaksi_medis_id: id
      },
      include: [
        {
          model: Obat,
          attributes: ["nama_obat"],
        },
      ],
    });
    
    if (!transaksi_obat_keluar) {
      return res.status(404).send({
        message: `Cannot find transaksi obat keluar with id=${id}.`,
      });
    }

    // const serializedTransaksiObatKeluar = obatKeluarSerializer.serialize(transaksi_obat_keluar);
    
    res.send({data: transaksi_obat_keluar});
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving transaksi obat keluar with id=${id}`,
    });
  }
};

// Update a transaksi obat keluar by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  TransaksiObatKeluar.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "transaksi obat keluar was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update transaksi obat keluar with id=${id}. Maybe transaksi obat keluar was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating transaksi obat keluar with id=" + id,
      });
    });
};

// Delete a transaksi obat keluar with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  TransaksiObatKeluar.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "transaksi obat keluar was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete transaksi obat keluar with id=${id}. Maybe transaksi obat keluar was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete transaksi obat keluar with id=" + id,
      });
    });
};

// Delete all transaksi obat keluars from the database.
exports.deleteAll = (req, res) => {
  TransaksiObatKeluar.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} transaksi obat keluars were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all transaksi obat keluars.",
      });
    });
};
