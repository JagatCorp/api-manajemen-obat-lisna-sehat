// const { Layanan } = require("./Layanan");
// Mengimpor Layanan dari db
// Assuming Layanan.js is in the same directory

const sequelize = require("../configs/database");
const { Model } = require("sequelize");
class TransaksiMedis extends Model {}

module.exports = (sequelize, Sequelize) => {
  const TransaksiMedis = sequelize.define("transaksi_medis", {
    // id

    url_qrcode: {
      type: Sequelize.STRING,
    },
    keluhan: {
      type: Sequelize.STRING,
    },
    harga: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: "TransaksiMedis",
    paranoid: true, // Enable soft deletes
    timestamps: true, // Enable timestamps (createdAt, updatedAt, deletedAt)
  });

  return TransaksiMedis;
};
