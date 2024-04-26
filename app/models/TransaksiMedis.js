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
  });

  return TransaksiMedis;
};
