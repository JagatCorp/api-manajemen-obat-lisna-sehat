const db = require("../models");
const Transaksidistributor = db.transaksidistributors;
const Barangdistributor = db.barangdistributors;
const Pembelidistributors = db.pembelidistributors;
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op, where } = require("sequelize");

// Create and Save a new transaksidistributor
// exports.create = async (req, res) => {
//   try {
//     // Validate request
//     if (
//       !req.body.jml_barang ||
//       !req.body.harga ||
//       !req.body.status ||
//       !req.body.nama_pembeli ||
//       !req.body.barang_distributorId
//     ) {
//       return res.status(400).send({ message: "Data is required!" });
//     }

//     // Find Barangdistributor by Barangdistributor_id
//     const dataBarangdistributor = await Barangdistributor.findByPk(
//       req.body.barang_distributorId
//     );
//     if (!dataBarangdistributor) {
//       return res.status(404).send({ message: "Barangdistributor not found!" });
//     }

//     // Create transaksidistributor object with Barangdistributor_id
//     const transaksidistributor = {
//       jml_barang: req.body.jml_barang,
//       harga: req.body.harga,
//       status: req.body.status,
//       barang_distributorId: req.body.barang_distributorId,
//       nama_pembeli: req.body.nama_pembeli,
//       // Assign Barangdistributor_id from request body
//     };

//     // Save transaksidistributor to the database
//     const createdTransaksidistributor = await Transaksidistributor.create(
//       transaksidistributor
//     );
//     res.send(createdTransaksidistributor);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       message: error.message || "Error creating transaksidistributor.",
//     });
//   }
// };

exports.create = async (req, res) => {
  try {
    // Validate request
    if (
      !req.body.jml_barang ||
      !req.body.harga ||
      !req.body.status ||
      !req.body.nama_pembeli ||
      !req.body.barang_distributorId
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

    // Check if there's enough stock
    if (
      parseInt(dataBarangdistributor.satuan_stok_barang) <
        parseInt(req.body.jml_barang) &&
      req.body.status == "Keluar"
    ) {
      return res.status(500).send({ message: "Not enough stock available!" });
    }

    if (req.body.status == "Keluar") {
      // Reduce stock in Barangdistributor
      dataBarangdistributor.satuan_stok_barang -= parseInt(req.body.jml_barang);
    } else {
      // Increase stock in Barangdistributor
      dataBarangdistributor.satuan_stok_barang += parseInt(req.body.jml_barang);
    }

    dataBarangdistributor.harga_satuan_barang = req.body.harga;
    await dataBarangdistributor.save();

    // Create transaksidistributor object with Barangdistributor_id
    const transaksidistributor = {
      jml_barang: req.body.jml_barang,
      harga: req.body.harga,
      status: req.body.status,
      barang_distributorId: req.body.barang_distributorId,
      nama_pembeli: req.body.nama_pembeli,
    };

    // Save transaksidistributor to the database
    const createdTransaksidistributor = await Transaksidistributor.create(
      transaksidistributor
    );

    res.send(createdTransaksidistributor);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: error.message || "Error creating transaksidistributor.",
    });
  }
};

// code benar tapi salah
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // Jika tidak ada query pencarian
    const keyword = req.query.keyword || "";
    const searchQuery = {
      where: {
        [Op.or]: [
          { jml_barang: { [Op.like]: `%${keyword}%` } },
          { harga: { [Op.like]: `%${keyword}%` } },
          { status: { [Op.like]: `%${keyword}%` } },
          { nama_pembeli: { [Op.like]: `%${keyword}%` } },
        ],
      },
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Barangdistributor,
          attributes: ["nama_barang", "urlGambar"],
        },
      ],
      // attributes: {
      //   exclude: ["createdAt", "updatedAt"],
      // },
    };

    const transaksidistributor = await Transaksidistributor.findAll(
      searchQuery
    );
    const totalCount = await Transaksidistributor.count();

    const totalPages = Math.ceil(totalCount / pageSize);

    res.send({
      data: transaksidistributor,
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
// export
exports.export = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Set end date to the end of the day

    const searchQuery = {
      include: [
        {
          model: Barangdistributor,
          attributes: ["nama_barang", "urlGambar"],
        },
      ],
      attributes: {
        exclude: ["updatedAt"],
      },
      where: {},
    };

    // Filter berdasarkan tanggal jika disediakan
    if (startDate && endDate) {
      searchQuery.where.createdAt = {
        [Op.between]: [start, end]
      };
    }

    const barang_distributor = await Transaksidistributor.findAll(searchQuery);

    const datatransaksidistributor = await Promise.all(barang_distributor.map(async (transaksiDistributor, index) => {
      return {
        no: ++index,
        'Nama Barang': transaksiDistributor.barangdistributor.nama_barang,
        'Jumlah Barang': transaksiDistributor.jml_barang,
        'Harga': transaksiDistributor.harga,
        'Nama Pembeli': transaksiDistributor.nama_pembeli,  
        'Status': transaksiDistributor.status,
       
      };
    }));

    res.send({
      data: datatransaksidistributor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving transaksi_mediss." });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const keyword = req.query.keyword || "";

    // Constructing the search query
    const searchQuery = {
      where: {
        deletedAt: {
          [Op.ne]: null, // Only select records with deletedAt not null
        },
        [Op.or]: [
          { jml_barang: { [Op.like]: `%${keyword}%` } },
          { harga: { [Op.like]: `%${keyword}%` } },
          { status: { [Op.like]: `%${keyword}%` } },
          { nama_pembeli: { [Op.like]: `%${keyword}%` } },
        ],
      },
      paranoid: false,
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Barangdistributor,
          attributes: ["nama_barang", "urlGambar"],
        },
      ],
    };

    const transaksidistributor = await Transaksidistributor.findAll(
      searchQuery
    );

    // Count total soft deleted records matching the search criteria
    const totalCount = await Transaksidistributor.count({
      where: {
        deletedAt: {
          [Op.ne]: null, // Count only records with deletedAt not null
        },
        [Op.or]: [
          { jml_barang: { [Op.like]: `%${keyword}%` } },
          { harga: { [Op.like]: `%${keyword}%` } },
          { status: { [Op.like]: `%${keyword}%` } },
          { nama_pembeli: { [Op.like]: `%${keyword}%` } },
        ],
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.send({
      data: transaksidistributor,
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
    const transaksidistributor = await Transaksidistributor.findByPk(id, {
      include: [
        {
          model: Barangdistributor,
          attributes: ["nama_barang", "urlGambar"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!transaksidistributor) {
      return res.status(404).send({
        message: `Cannot find transaksidistributor with id=${id}.`,
      });
    }

    res.send(transaksidistributor);
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

exports.restore = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the soft deleted transaction
    const transaksidistributor = await Transaksidistributor.findOne({
      where: {
        id: id,
      },
      paranoid: false
    });

    
    const barangdistributor = await Barangdistributor.findOne({
      where: {
        id: transaksidistributor.barang_distributorId,
      }
    })

    // return res.status(500).json({
    //   message: barangdistributor
    // })

    // Check if there's enough stock
    if (
      parseInt(barangdistributor.satuan_stok_barang) <
        parseInt(transaksidistributor.jml_barang) &&
        transaksidistributor.status == "Keluar"
    ) {
      return res.status(500).send({ message: "Not enough stock available!" });
    }

    if (transaksidistributor.status == "Keluar") {
      // Reduce stock in Barangdistributor
      barangdistributor.satuan_stok_barang -= parseInt(transaksidistributor.jml_barang);
    } else {
      // Increase stock in Barangdistributor
      barangdistributor.satuan_stok_barang += parseInt(transaksidistributor.jml_barang);
    }

    await barangdistributor.save();

    if (!transaksidistributor) {
      return res.status(404).json({
        message: `Cannot find soft deleted transaksidistributor with id=${id}.`,
      });
    }

    // Restore the transaction by setting deletedAt to null
    // transaksidistributor.deletedAt = null;
    await transaksidistributor.restore();

    return res.status(200).json({
      message: "Transaksidistributor was restored successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error restoring transaksidistributor with id=" + id,
    });
  }
};

// Delete a transaksidistributor with the specified id in the request
// exports.delete = (req, res) => {
//   const id = req.params.id;
//   const currentDate = new Date().toISOString();

//   Transaksidistributor.update(
//     { deletedAt: currentDate },
//     { where: { id: id } }
//   )
//     .then((num) => {
//       if (num == 1) {
//         res.send({
//           message: "transaksidistributor was soft deleted successfully!",
//         });
//       } else {
//         res.send({
//           message: `Cannot soft delete transaksidistributor with id=${id}. Maybe transaksidistributor was not found!`,
//         });
//       }
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: "Could not soft delete transaksidistributor with id=" + id,
//       });
//     });
// };

exports.delete = async (req, res) => {
  const id = req.params.id;
  const currentDate = new Date().toISOString();

  try {
    // Find the transaction to get the jml_barang and barang_distributorId
    const transaksidistributor = await Transaksidistributor.findByPk(id);
    if (!transaksidistributor) {
      return res.status(404).send({
        message: `Cannot soft delete transaksidistributor with id=${id}. Maybe transaksidistributor was not found!`,
      });
    }

    // Find the associated Barangdistributor
    const dataBarangdistributor = await Barangdistributor.findByPk(
      transaksidistributor.barang_distributorId
    );
    if (!dataBarangdistributor) {
      return res.status(404).send({
        message: `Cannot find Barangdistributor with id=${transaksidistributor.barang_distributorId}`,
      });
    }

    // Add the jml_barang back to satuan_stok_barang
    // return res.status(400).send({ message: transaksidistributor.status == 'Keluar' });
    if (transaksidistributor.status == "Keluar") {
      // Increase stock in Barangdistributor
      dataBarangdistributor.satuan_stok_barang += parseInt(
        transaksidistributor.jml_barang
      );
    } else {
      if (
        parseInt(dataBarangdistributor.satuan_stok_barang) -
          parseInt(transaksidistributor.jml_barang) <
        0
      ) {
        return res.status(400).send({ message: "Not enough stock available!" });
      } else {
        // Reduce stock in Barangdistributor
        dataBarangdistributor.satuan_stok_barang -= parseInt(
          transaksidistributor.jml_barang
        );
      }
    }
    await dataBarangdistributor.save();

    // Update the deletedAt field to soft delete the transaction
    await Transaksidistributor.update(
      { deletedAt: currentDate },
      { where: { id: id } }
    );

    res.send({
      message: "transaksidistributor was soft deleted successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Could not soft delete transaksidistributor with id=" + id,
    });
  }
};
// delete permanent
exports.deletePermanent = (req, res) => {
  const id = req.params.id;

  Transaksidistributor.destroy({
    where: { id: id },
    force: true, // Menghapus permanen
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
