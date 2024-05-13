const db = require("../models");
const TransaksiObatKeluar = db.transaksi_obat_keluar;
// const Op = db.Sequelize.Op;
// const { Op } = require("sequelize");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");

// Create and Save a new satuan
exports.create = async (req, res) => {
  try {
    // Validate request
    if (
      !req.body.nama_satuan ||
      !req.body.harga
    ) {
      return res.status(400).send({ message: "Data is required!" });
    }

    // Create satuan object with layanan_id
    const satuan = {
      nama_satuan: req.body.nama_satuan,
      harga: req.body.harga
    };

    // Save satuan to the database
    const createdSatuan = await Satuan.create(satuan);
    res.send(createdSatuan);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message || "Error creating satuan." });
  }
};

const satuanSerializer = new JSONAPISerializer('satuan', {
  attributes: ['nama_satuan'],
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
      where: {
        [Op.or]: [
          { nama_satuan: { [Op.like]: `%${keyword}%` } },
        ],
      },
      limit: pageSize,
      offset: offset,
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    };

    const satuan = await Satuan.findAll(searchQuery);
    const totalCount = await Satuan.count(searchQuery);
    // Menghitung total jumlah satuan
    // const totalCount = await Satuan.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    const satuanData = satuanSerializer.serialize(satuan);
    
    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: satuanData,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving satuans." });
  }
};

// Find a single admin with an id

exports.findOne = async (req, res) => {
  const id = req.params.id;
  
  try {
    const satuan = await Satuan.findByPk(id);
    
    if (!satuan) {
      return res.status(404).send({
        message: `Cannot find satuan with id=${id}.`,
      });
    }

    const serializedSatuan = satuanSerializer.serialize(satuan);
    
    res.send(serializedSatuan);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving satuan with id=${id}`,
    });
  }
};

// Update a satuan by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  Satuan.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "satuan was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update satuan with id=${id}. Maybe satuan was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating satuan with id=" + id,
      });
    });
};

// Delete a satuan with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Satuan.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "satuan was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete satuan with id=${id}. Maybe satuan was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete satuan with id=" + id,
      });
    });
};

// Delete all satuans from the database.
exports.deleteAll = (req, res) => {
  Satuan.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} satuans were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all satuans.",
      });
    });
};
