const db = require("../models");
const PenjualPembuat = db.penjualpembuat;
const Principle = db.principle;
// const Op = db.Sequelize.Op;
// const { Op } = require("sequelize");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");

// Create and Save a new penjualpembuat
exports.create = async (req, res) => {
  try {
    // Validate request
    if (
      !req.body.distributor_id ||
      !req.body.principle_id
    ) {
      return res.status(400).send({ message: "Data is required!" });
    }

    // Create penjualpembuat object with layanan_id
    const penjualPembuat = {
      distributor_id: req.body.distributor_id,
      principle_id: req.body.principle_id,
    };

    // Simpan penjualPembuat ke database
    const createdPenjualPembuat = await PenjualPembuat.create(penjualPembuat);

    // Temukan data principle berdasarkan principle_id dari createdPenjualPembuat
    // const principle = await Principle.findByPk(createdPenjualPembuat.principle_id);

    // let newArray = [];
    // newArray.push({ createdPenjualPembuat, nama_instansi: principle.nama_instasi });

    // Kirimkan respons dengan array yang berisi objek createdPenjualPembuat
    res.send(createdPenjualPembuat);
    
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: error.message || "Error creating penjualPembuat." });
  }
};

const penjualPembuatSerializer = new JSONAPISerializer('penjualPembuat', {
  attributes: ['distributor_id', 'principle_id'],
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
      //     { nama_penjualPembuat: { [Op.like]: `%${keyword}%` } },
      //   ],
      // },
      limit: pageSize,
      offset: offset,
    };

    const penjualPembuat = await PenjualPembuat.findAll(searchQuery);
    const totalCount = await PenjualPembuat.count(searchQuery);
    // Menghitung total jumlah penjualPembuat
    // const totalCount = await PenjualPembuat.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    const penjualPembuatData = penjualPembuatSerializer.serialize(penjualPembuat);

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: penjualPembuatData,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving penjualPembuats." });
  }
};

// Find a single admin with an id

exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const penjualPembuat = await PenjualPembuat.findByPk(id);

    if (!penjualPembuat) {
      return res.status(404).send({
        message: `Cannot find penjualPembuat with id=${id}.`,
      });
    }

    const serializedPenjualPembuat = penjualPembuatSerializer.serialize(penjualPembuat);

    res.send(serializedPenjualPembuat);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving penjualPembuat with id=${id}`,
    });
  }
};

// Update a penjualPembuat by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  PenjualPembuat.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "penjualPembuat was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update penjualPembuat with id=${id}. Maybe penjualPembuat was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating penjualPembuat with id=" + id,
      });
    });
};

// Delete a penjualPembuat with the specified id in the request
// Delete a Penjualpembuat with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  PenjualPembuat.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Penjualpembuat was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Penjualpembuat with id=${id}. Maybe Penjualpembuat was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Penjualpembuat with id=" + id
      });
    });
};

// Delete all penjualPembuats from the database.
exports.deleteAll = (req, res) => {
  PenjualPembuat.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} penjualPembuats were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all penjualPembuats.",
      });
    });
};
