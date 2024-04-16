const db = require("../models");
const Pembelidistributors = db.pembelidistributors;
const Op = db.Sequelize.Op; // Import bcrypt for password hashing
const bcrypt = require("bcryptjs");

const JSONAPISerializer = require("jsonapi-serializer").Serializer;

// Create and Save a new pembelidistributors
exports.create = async (req, res) => {
  try {
 

    if (!req.body.nama_pembeli) {
      return res
        .status(400)
        .send({ message: "Nama Pembeli are required!" });
    }


    // Create pembelidistributor object with hashed password
    const pembelidistributor = {
      nama_pembeli: req.body.nama_pembeli,
    
    };

    // Save pembelidistributor to the database
    const createdPembelidistributor = await Pembelidistributors.create(pembelidistributor);
    res.send(createdPembelidistributor);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: error.message || "Error creating pembelidistributor." });
  }
};

// serialize
const pembelidistributorSerializer = new JSONAPISerializer("pembelidistributors", {
  attributes: ["nama_pembeli"],
});

// Retrieve all pembelidistributorss from the database.
exports.findAll = async (req, res) => {
  try {
    // Mendapatkan nilai halaman dan ukuran halaman dari query string (default ke halaman 1 dan ukuran 10 jika tidak disediakan)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Menghitung offset berdasarkan halaman dan ukuran halaman
    const offset = (page - 1) * pageSize;

    // Mengambil data pembelidistributors dengan pagination menggunakan Sequelize
    // const pembelidistributors = await Pembelidistributors.findAll({
    //   limit: pageSize,
    //   offset: offset,
    // });
    const keyword = req.query.keyword || "";

    // Query pencarian
    const searchQuery = {
      where: {
        [Op.or]: [
          { nama_pembeli: { [Op.like]: `%${keyword}%` } },
        ],
      },
      limit: pageSize,
      offset: offset,
    };
    const pembelidistributors = await Pembelidistributors.findAll(searchQuery);
    const totalCount = await Pembelidistributors.count(searchQuery);
    // Menghitung total jumlah pembelidistributors
    // const totalCount = await Pembelidistributors.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    // Menggunakan serializer untuk mengubah data menjadi JSON
    const pembelidistributor = pembelidistributorSerializer.serialize(pembelidistributors);

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: pembelidistributor,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving pembelidistributorss." });
  }
};

// Find a single admin with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Pembelidistributors.findByPk(id)
    .then((data) => {
      if (data) {
        const serializedData = pembelidistributorSerializer.serialize(data);
        res.send(serializedData);
      } else {
        res.status(404).send({
          message: `Cannot find pembelidistributor with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({
        message: "Error retrieving pembelidistributor with id=" + id,
      });
    });
};

// Update a pembelidistributors by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;


  Pembelidistributors.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "pembelidistributors was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update pembelidistributors with id=${id}. Maybe pembelidistributors was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating pembelidistributors with id=" + id,
      });
    });
};

// Delete a pembelidistributors with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Pembelidistributors.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "pembelidistributors was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete pembelidistributors with id=${id}. Maybe pembelidistributors was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete pembelidistributors with id=" + id,
      });
    });
};

// Delete all pembelidistributorss from the database.
exports.deleteAll = (req, res) => {
  Pembelidistributors.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} pembelidistributorss were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all pembelidistributorss.",
      });
    });
};

// Find all filter pembelidistributorss (phone)
// exports.findAllPublished = (req, res) => {
//     pembelidistributors.findAll({ where: { phone: true } })
//       .then(data => {
//         res.send(data);
//       })
//       .catch(err => {
//         res.status(500).send({
//           message:
//             err.message || "Some error occurred while retrieving pembelidistributorss."
//         });
//       });
//   };
