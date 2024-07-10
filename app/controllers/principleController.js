const db = require("../models");
const Principle = db.principle;
const Penjualpembuat = db.penjualpembuat;
const Barangdistributor = db.barangdistributors;
// const Op = db.Sequelize.Op;
// const { Op } = require("sequelize");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");

// Create and Save a new principle
exports.create = async (req, res) => {
  try {
    // Validate request
    if (
      !req.body.nama_instansi
    ) {
      return res.status(400).send({ message: "Data is required!" });
    }

    // Create principle object with layanan_id
    const principle = {
      nama_instansi: req.body.nama_instansi,
    };

    // Save principle to the database
    const createdPrinciple = await Principle.create(principle);
    res.send(createdPrinciple);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message || "Error creating principle." });
  }
};

const principleSerializer = new JSONAPISerializer('principle', {
  attributes: ['nama_instansi', 'penjualpembuat'],
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
          { nama_instansi: { [Op.like]: `%${keyword}%` } },
        ],
      },
      limit: pageSize,
      offset: offset,
    };

    const principle = await Principle.findAll(searchQuery);

    const penjualPembuats = await Penjualpembuat.findAll({
      include: [
        {
          model: Barangdistributor,
          attributes: ["nama_distributor"],
        },
      ],
    });

    
    
    // Menambahkan properti penjualpembuat pada setiap principle
    const principleWithPenjualPembuat = principle.map(principle => {
      const penjualPembuatList = penjualPembuats.filter(pp => pp.principle_id === principle.id);
      return {
        ...principle.toJSON(),
        penjualpembuat: penjualPembuatList
      };
    });

    
    const totalCount = await Principle.count(searchQuery);
    // Menghitung total jumlah principle
    // const totalCount = await Principle.count();
    
    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // const principleData = principleSerializer.serialize(principle);
    const principleData = principleSerializer.serialize(principleWithPenjualPembuat);
    // return res.status(500).send({ message: principleData });
    
    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: principleData,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving principles." });
  }
};

// Find a single admin with an id

exports.findOne = async (req, res) => {
  const id = req.params.id;
  
  try {
    const principle = await Principle.findByPk(id);
    
    if (!principle) {
      return res.status(404).send({
        message: `Cannot find principle with id=${id}.`,
      });
    }

    const serializedPrinciple = principleSerializer.serialize(principle);
    
    res.send(serializedPrinciple);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving principle with id=${id}`,
    });
  }
};

// Update a principle by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  Principle.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "principle was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update principle with id=${id}. Maybe principle was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating principle with id=" + id,
      });
    });
};

// Delete a principle with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Principle.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "principle was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete principle with id=${id}. Maybe principle was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete principle with id=" + id,
      });
    });
};

// Delete all principles from the database.
exports.deleteAll = (req, res) => {
  Principle.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} principles were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all principles.",
      });
    });
};
