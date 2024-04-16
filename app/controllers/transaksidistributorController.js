const db = require("../models");
const Transaksidistributor = db.transaksidistributors;
const Barangdistributor = db.barangdistributors;
const Pembelidistributors = db.pembelidistributors;
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");

// Create and Save a new transaksidistributor
exports.create = async (req, res) => {
  try {
    // Validate request
    if (
      !req.body.jml_barang ||
      !req.body.barang_distributorId ||
      !req.body.pembeli_distributorId
    ) {
      return res.status(400).send({ message: "Data is required!" });
    }

    // Find Barangdistributor by Barangdistributor_id
    const dataBarangdistributor = await Barangdistributor.findByPk(
      req.body.barang_distributorId
    );
    if (!dataBarangdistributor) {
      return res.status(404).send({ message: "Barangdistributor not found!" });
    }
    const dataPembelidistributors = await Pembelidistributors.findByPk(
      req.body.pembeli_distributorId
    );
    if (!dataPembelidistributors) {
      return res
        .status(404)
        .send({ message: "Pembelidistributors not found!" });
    }

    // Create transaksidistributor object with Barangdistributor_id
    const transaksidistributor = {
      jml_barang: req.body.jml_barang,
      barang_distributorId: req.body.barang_distributorId,
      pembeli_distributorId: req.body.pembeli_distributorId,
      // Assign Barangdistributor_id from request body
    };

    // Save transaksidistributor to the database
    const createdTransaksidistributor = await Transaksidistributor.create(
      transaksidistributor
    );
    res.send(createdTransaksidistributor);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({
        message: error.message || "Error creating transaksidistributor.",
      });
  }
};

// Serialize
const transaksidistributorSerializer = new JSONAPISerializer("transaksidistributor", {
    attributes: ["jml_barang", "Barangdistributor", "Pembelidistributors"],
   
    keyForAttribute: "underscore_case",
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
        [Op.or]: [{ jml_barang: { [Op.like]: `%${keyword}%` } }],
      },
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Barangdistributor,
        attributes: ["nama_barang"],
        },
        {
          model: Pembelidistributors,
        attributes: ["nama_pembeli"],
        },
      ],
    };

    const transaksidistributor = await Transaksidistributor.findAll(
      searchQuery
    );
    const totalCount = await Transaksidistributor.count(searchQuery);
    // Menghitung total jumlah transaksidistributor
    // const totalCount = await Transaksidistributor.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    // Menggunakan serializer untuk mengubah data menjadi JSON
    const transaksidistributors =
      transaksidistributorSerializer.serialize(transaksidistributor);

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: transaksidistributors,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Error retrieving transaksidistributors." });
  }
};

// Find a single admin with an id

exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const transaksidistributor = await Transaksidistributor.findByPk(id);

    if (!transaksidistributor) {
      return res.status(404).send({
        message: `Cannot find transaksidistributor with id=${id}.`,
      });
    }

    const serializedTransaksidistributor =
      transaksidistributorSerializer.serialize(transaksidistributor);

    res.send(serializedTransaksidistributor);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving transaksidistributor with id=${id}`,
    });
  }
};

// Update a transaksidistributor by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  Transaksidistributor.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "transaksidistributor was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update transaksidistributor with id=${id}. Maybe transaksidistributor was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating transaksidistributor with id=" + id,
      });
    });
};

// Delete a transaksidistributor with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Transaksidistributor.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "transaksidistributor was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete transaksidistributor with id=${id}. Maybe transaksidistributor was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete transaksidistributor with id=" + id,
      });
    });
};

// Delete all transaksidistributors from the database.
exports.deleteAll = (req, res) => {
  Transaksidistributor.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} transaksidistributors were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all transaksidistributors.",
      });
    });
};
