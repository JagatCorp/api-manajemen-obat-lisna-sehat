const db = require("../models");
const Obat = db.obat;
const Satuan = db.satuan;
// const Op = db.Sequelize.Op;
// const { Op } = require("sequelize");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");

const multer = require("multer");

// Create and Save a new obat
exports.create = async (req, res) => {
  try {
    // Validate request
    if (
      !req.body.nama_obat ||
      !req.body.satuan_box ||
      !req.body.satuan_sat ||
      !req.body.qty_box ||
      !req.body.qty_sat ||
      !req.body.stok ||
      !req.file
    ) {
      return res.status(400).send({ message: "Data is required!" });
    }
    const file = req.file;

    // Process uploaded files:
    // Simpan atau proses gambar dan dapatkan URL atau path-nya
    const imageName = `${file.filename}`;
    const imageUrl = `${req.protocol}://${req.get("host")}/obat/${
      file.filename
    }`;

    const satuan_box = await Satuan.findByPk(req.body.satuan_box);
    if (!satuan_box) {
      return res.status(404).send({ message: "Satuan box not found!" });
    }

    const satuan_sat = await Satuan.findByPk(req.body.satuan_sat);
    if (!satuan_sat) {
      return res.status(404).send({ message: "Satuan sat not found!" });
    }

    // Create obat object with layanan_id
    const obat = {
      nama_obat: req.body.nama_obat,
      satuan_box: req.body.satuan_box,
      satuan_sat: req.body.satuan_sat,
      qty_box: req.body.qty_box,
      qty_sat: req.body.qty_sat,
      stok: req.body.stok,
      // gambar_obat: req.body.gambar_obat,
      gambar_obat: imageName,
      urlGambar: imageUrl,
    };

    // Save obat to the database
    const createdObat = await Obat.create(obat);
    res.status(201).send(createdObat);
    // const newBarangdistributor = await Barangdistributor.create(barangdistributor);
    // res.status(201).send(newBarangdistributor);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message || "Error creating obat." });
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
      where: {
        [Op.or]: [{ nama_obat: { [Op.like]: `%${keyword}%` } }],
      },
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Satuan,
          as: "satuan_box",
          attributes: ["nama_satuan"],
        },
        {
          model: Satuan,
          as: "satuan_sat",
          attributes: ["nama_satuan"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    };

    const obat = await Obat.findAll(searchQuery);
    const totalCount = await Obat.count(searchQuery);
    // Menghitung total jumlah obat
    // const totalCount = await Obat.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: obat,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving obats." });
  }
};

// Find a single admin with an id

exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const obat = await Obat.findByPk(id);

    if (!obat) {
      return res.status(404).send({
        message: `Cannot find obat with id=${id}.`,
      });
    }

    const serializedObat = obatSerializer.serialize(obat);

    res.send(serializedObat);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving obat with id=${id}`,
    });
  }
};

// Update a obat by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  Obat.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "obat was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update obat with id=${id}. Maybe obat was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating obat with id=" + id,
      });
    });
};

// Delete a obat with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Obat.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "obat was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete obat with id=${id}. Maybe obat was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete obat with id=" + id,
      });
    });
};

// Delete all obats from the database.
exports.deleteAll = (req, res) => {
  Obat.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} obats were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all obats.",
      });
    });
};
