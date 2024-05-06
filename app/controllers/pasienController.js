const db = require("../models");
const Pasien = db.pasien;
const Op = db.Sequelize.Op; // Import bcrypt for password hashing
const bcrypt = require("bcryptjs");

const JSONAPISerializer = require("jsonapi-serializer").Serializer;

// Create and Save a new pasien
exports.create = async (req, res) => {
  try {
    if (
      !req.body.nama ||
      !req.body.alamat ||
      !req.body.jk ||
      !req.body.no_telp ||
      !req.body.tgl_lahir
    ) {
      return res.status(400).send({
        message:
          "nama, alamat, jk, no_telp, tgl_lahir, gol_darah are required!",
      });
    }

    // Hash password securely using bcrypt
    const saltRounds = 10; // Adjust salt rounds as needed (higher for stronger hashing)
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create pasien object with hashed password
    const pasien = {
      nama: req.body.nama,
      alamat: req.body.alamat,
      jk: req.body.jk,
      no_telp: req.body.no_telp,
      alergi: req.body.alergi,
      tgl_lahir: req.body.tgl_lahir,
      gol_darah: req.body.gol_darah,
      username: req.body.username,
      password: hashedPassword,
    };

    // Save pasien to the database
    const createPasien = await Pasien.create(pasien);
    res.send(createPasien);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: error.message || "Error creating pasien." });
  }
};

// serialize
const pasienerializer = new JSONAPISerializer("pasien", {
  attributes: [
    "nama",
    "alamat",
    "jk",
    "no_telp",
    "alergi",
    "tgl_lahir",
    "gol_darah",
  ],
  keyForAttribute: "underscore_case",
});

// Retrieve all pasiens from the database.
exports.findAll = async (req, res) => {
  try {
    // Mendapatkan nilai halaman dan ukuran halaman dari query string (default ke halaman 1 dan ukuran 10 jika tidak disediakan)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Menghitung offset berdasarkan halaman dan ukuran halaman
    const offset = (page - 1) * pageSize;

    // Mengambil data pasien dengan pagination menggunakan Sequelize
    // const pasien = await Pasien.findAll({
    //   limit: pageSize,
    //   offset: offset,
    // });
    const keyword = req.query.keyword || "";

    // Query pencarian
    const searchQuery = {
      where: {
        [Op.or]: [
          { nama: { [Op.like]: `%${keyword}%` } },
          { alamat: { [Op.like]: `%${keyword}%` } },
          { jk: { [Op.like]: `%${keyword}%` } },
          { no_telp: { [Op.like]: `%${keyword}%` } },
          { alergi: { [Op.like]: `%${keyword}%` } },
          { tgl_lahir: { [Op.like]: `%${keyword}%` } },
          { gol_darah: { [Op.like]: `%${keyword}%` } },
        ],
      },
      limit: pageSize,
      offset: offset,
    };
    const pasien = await Pasien.findAll(searchQuery);
    const totalCount = await Pasien.count(searchQuery);
    // Menghitung total jumlah pasien
    // const totalCount = await Pasien.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    // Menggunakan serializer untuk mengubah data menjadi JSON
    const pasiens = pasienerializer.serialize(pasien);

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: pasiens,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving pasiens." });
  }
};

// Find a single admin with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Pasien.findByPk(id)
    .then((data) => {
      if (data) {
        const serializedData = pasienerializer.serialize(data);
        res.send(serializedData);
      } else {
        res.status(404).send({
          message: `Cannot find pasien with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({
        message: "Error retrieving pasien with id=" + id,
      });
    });
};

// Update a pasien by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  Pasien.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "pasien was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update pasien with id=${id}. Maybe pasien was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating pasien with id=" + id,
      });
    });
};

// Delete a pasien with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Pasien.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "pasien was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete pasien with id=${id}. Maybe pasien was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete pasien with id=" + id,
      });
    });
};

// Delete all pasiens from the database.
exports.deleteAll = (req, res) => {
  Pasien.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} pasiens were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all pasiens.",
      });
    });
};

// Find all filter pasiens (phone)
// exports.findAllPublished = (req, res) => {
//     pasien.findAll({ where: { phone: true } })
//       .then(data => {
//         res.send(data);
//       })
//       .catch(err => {
//         res.status(500).send({
//           message:
//             err.message || "Some error occurred while retrieving pasiens."
//         });
//       });
//   };
