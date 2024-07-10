const db = require("../models");

const Barangdistributor = db.barangdistributors;
const Penjualpembuat = db.penjualpembuat;
const Principle = db.principle;
const Satuan = db.satuan;
const Op = db.Sequelize.Op;
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const multer = require("multer");

// Create and Save a new Barangdistributor
exports.create = async (req, res) => {
  try {
    // Buat objek Barangdistributor dengan URL gambar yang telah diproses
    const barangdistributor = {
      nama_distributor: req.body.nama_distributor,
    };

    // Simpan Barangdistributor ke database menggunakan metode yang sesuai
    // Tangani kesalahan dan skenario keberhasilan sesuai kebutuhan

    // Contoh penggunaan Sequelize (ganti dengan ORM Anda):
    const newBarangdistributor = await Barangdistributor.create(
      barangdistributor
    );
    res.status(200).send(newBarangdistributor); // Atau respons yang diinginkan
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const barangdistributorSerializer = new JSONAPISerializer("barangdistributor", {
  attributes: [
    "nama_distributor",
  ],
  keyForAttribute: "underscore_case",
});


// Retrieve all Barangdistributors from the database.
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const keyword = req.query.keyword || "";

    // Pencarian
    const searchQuery = {
      where: {
        [Op.or]: [
          { nama_distributor: { [Op.like]: `%${keyword}%` } },
        ],
      },
      limit: pageSize,
      offset: offset,
    };

    // Mengambil data barangdistributor dengan pagination dan pencarian menggunakan Sequelize
    const barangdistributors = await Barangdistributor.findAll(searchQuery);
    // return res.status(500).send({ message: penjualPembuats });

    // Mengambil data penjualpembuat dengan asosiasi principle
    const penjualPembuats = await Penjualpembuat.findAll({
      include: [
        {
          model: Principle,
          attributes: ["nama_instansi"],
        },
      ],
    });


    // Menambahkan properti penjualpembuat pada setiap barangdistributor
    const barangdistributorsWithPenjualPembuat = barangdistributors.map(barangdistributor => {
      const penjualPembuatList = penjualPembuats.filter(pp => pp.distributor_id === barangdistributor.id);
      return {
        ...barangdistributor.toJSON(),
        penjualpembuat: penjualPembuatList
      };
    });



    // Total count without limit and offset
    const totalCount = await Barangdistributor.count({
      where: {
        [Op.or]: [
          { nama_distributor: { [Op.like]: `%${keyword}%` } },
        ],
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.send({
      data: barangdistributorsWithPenjualPembuat,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving barangdistributors." });
  }
};



// Find a single admin with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    // res.status(200).send({ message: req.params.id });

    const barangdistributor = await Barangdistributor.findByPk(id, {
      include: [
        {
          model: Satuan,
          attributes: ["nama_satuan"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!barangdistributor) {
      return res.status(404).send({
        message: `Cannot find barangdistributor with id=${id}.`,
      });
    }

    res.send(barangdistributor);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving barangdistributor with id=${id}`,
    });
  }
};

// Update a Barangdistributor by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    let barangdistributorData = req.body;

    // Temukan barangdistributor yang akan diupdate
    const barangdistributor = await Barangdistributor.findByPk(id);

    // Perbarui data barangdistributor dengan data baru, termasuk data yang tidak berubah
    await barangdistributor.update(barangdistributorData);

    res.send({
      message: "barangdistributor berhasil diubah.",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete a Barangdistributor with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Barangdistributor.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Barangdistributor was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Barangdistributor with id=${id}. Maybe Barangdistributor was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Barangdistributor with id=" + id,
      });
    });
};

// Delete all Barangdistributors from the database.
exports.deleteAll = (req, res) => {
  Barangdistributor.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} Barangdistributors were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all Barangdistributors.",
      });
    });
};

// Find all filter Barangdistributors (phone)
// exports.findAllPublished = (req, res) => {
//     Barangdistributor.findAll({ where: { phone: true } })
//       .then(data => {
//         res.send(data);
//       })
//       .catch(err => {
//         res.status(500).send({
//           message:
//             err.message || "Some error occurred while retrieving Barangdistributors."
//         });
//       });
//   };
