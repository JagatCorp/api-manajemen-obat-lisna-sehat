const db = require("../models");

const Barangdistributor = db.barangdistributors;
const Op = db.Sequelize.Op;
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const multer = require('multer');

// Create and Save a new Barangdistributor
exports.create = async (req, res) => {
  try {
    const file = req.file;

    // Process uploaded files:
      // Simpan atau proses gambar dan dapatkan URL atau path-nya
      const imageName = `${file.filename}`;
      const imageUrl = `${req.protocol}://${req.get('host')}/barangdistributor/${file.filename}`;
    

    // Ambil URL gambar pertama jika tersedia

    // Buat objek Barangdistributor dengan URL gambar yang telah diproses
    const barangdistributor = {
      nama_barang: req.body.nama_barang,
      satuan_barang: req.body.satuan_barang,
      harga_satuan_barang: req.body.harga_satuan_barang,
      satuan_stok_barang: req.body.satuan_stok_barang,
      gambar: imageName, 
      urlGambar: imageUrl, 
    };

    // Simpan Barangdistributor ke database menggunakan metode yang sesuai
    // Tangani kesalahan dan skenario keberhasilan sesuai kebutuhan

    // Contoh penggunaan Sequelize (ganti dengan ORM Anda):
    const newBarangdistributor = await Barangdistributor.create(barangdistributor);
    res.status(201).send(newBarangdistributor); // Atau respons yang diinginkan
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

  const barangdistributorSerializer = new JSONAPISerializer('barangdistributor', {
    attributes: ['nama_barang', 'satuan_barang', 'harga_satuan_barang', 'satuan_stok_barang', 'gambar', 'urlGambar'],
    keyForAttribute: 'camelCase',

  });
  

// Retrieve all Barangdistributors from the database.
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const keyword = req.query.keyword || '';

    // pencarian
    const searchQuery = {
      where: {
        [Op.or]: [
          { nama_barang: { [Op.like]: `%${keyword}%` } },
          { satuan_barang: { [Op.like]: `%${keyword}%` } },
          { harga_satuan_barang: { [Op.like]: `%${keyword}%` } },
       
        ]
      },
      limit: pageSize,
      offset: offset
    };

    // Mengambil data barangdistributor dengan pagination dan pencarian menggunakan Sequelize
    const barangdistributors = await Barangdistributor.findAll(searchQuery);
    const totalCount = await Barangdistributor.count(searchQuery);

    const totalPages = Math.ceil(totalCount / pageSize);
    const barangdistributor = barangdistributorSerializer.serialize(barangdistributors);

    res.send({
      data: barangdistributor,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error retrieving barangdistributors.' });
  }
};


// Find a single admin with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Barangdistributor.findByPk(id)
    .then(data => {
      if (data) {
        const serializedData = barangdistributorSerializer.serialize(data);
        res.send(serializedData);
      } else {
        res.status(404).send({
          message: `Cannot find barangdistributor with id=${id}.`
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send({
        message: "Error retrieving barangdistributor with id=" + id
      });
    });
};

// Update a Barangdistributor by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const file = req.file;

  try {
    let barangdistributorData = req.body;
    
    // Jika pengguna mengunggah gambar baru, gunakan gambar yang baru diupdate
    if (file) {
      const imageName = file.filename;
      const imageUrl = `${req.protocol}://${req.get('host')}/barangdistributor/${file.filename}`;

      barangdistributorData = {
        ...barangdistributorData,
        gambar: imageName,
        urlGambar: imageUrl,
      };
    }
    
    // Temukan barangdistributor yang akan diupdate
    const barangdistributor = await Barangdistributor.findByPk(id);
    if (!barangdistributor) {
      return res.status(404).send({ message: `barangdistributor with id=${id} not found` });
    }

    // Perbarui data barangdistributor dengan data baru, termasuk data yang tidak berubah
    await barangdistributor.update(barangdistributorData);

    res.send({
      message: "barangdistributor berhasil diubah."
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete a Barangdistributor with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Barangdistributor.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Barangdistributor was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Barangdistributor with id=${id}. Maybe Barangdistributor was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Barangdistributor with id=" + id
        });
      });
  };

// Delete all Barangdistributors from the database.
exports.deleteAll = (req, res) => {
    Barangdistributor.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} Barangdistributors were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Barangdistributors."
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