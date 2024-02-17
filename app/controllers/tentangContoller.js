const db = require("../models");
const Tentang = db.tentang;
const Op = db.Sequelize.Op;
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

// Create and Save a new Tentang
exports.create = (req, res) => {
    // Validate request
    if (!req.body.tentang) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a Tutorial
    const tentang = {
      tentang: req.body.tentang,
      phone: req.body.phone,
      email: req.body.email,
      instagram: req.body.instagram,
    };
  
    // Save Tutorial in the database
    Tentang.create(tentang)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Tentng."
        });
      });
  };

  const tentangSerializer = new JSONAPISerializer('tentang', {
    attributes: ['tentang', 'phone', 'lokasi', 'email'],
  });
  

// Retrieve all Tentangs from the database.
exports.findAll = async (req, res) => {
  try {
    const tentangs = await Tentang.findAll();
    
    // Gunakan serializer untuk mengubah data menjadi JSON
    const tentang = tentangSerializer.serialize(tentangs);

    // Kirim response dengan data JSON
    res.send(tentang);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error retrieving tentang.' });
  }
};

// Find a single admin with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Tentang.findByPk(id)
    .then(data => {
      if (data) {
        const serializedData = tentangSerializer.serialize(data);
        res.send(serializedData);
      } else {
        res.status(404).send({
          message: `Cannot find tentang with id=${id}.`
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send({
        message: "Error retrieving tentang with id=" + id
      });
    });
};

// Update a Tentang by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    Tentang.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Tentang was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Tentang with id=${id}. Maybe Tentang was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Tentang with id=" + id
        });
      });
  };

// Delete a Tentang with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Tentang.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Tentang was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Tentang with id=${id}. Maybe Tentang was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Tentang with id=" + id
        });
      });
  };

// Delete all Tentangs from the database.
exports.deleteAll = (req, res) => {
    Tentang.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} Tentangs were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Tentangs."
        });
      });
  };

// Find all filter Tentangs (phone)
// exports.findAllPublished = (req, res) => {
//     Tentang.findAll({ where: { phone: true } })
//       .then(data => {
//         res.send(data);
//       })
//       .catch(err => {
//         res.status(500).send({
//           message:
//             err.message || "Some error occurred while retrieving Tentangs."
//         });
//       });
//   };