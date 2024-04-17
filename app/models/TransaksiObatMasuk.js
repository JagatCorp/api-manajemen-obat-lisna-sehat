// const { Layanan } = require("./Layanan");
// Mengimpor Layanan dari db
// Assuming Layanan.js is in the same directory

const sequelize = require("../configs/database");
const { Model } = require("sequelize");
class TransaksiObatMasuk extends Model {}

module.exports = (sequelize, Sequelize) => {
  const TransaksiObatMasuk = sequelize.define("transaksi_obat_masuk", {
    // id
    // obat_id, foreign obat
    // principle_id, foreign principle
    stok_obat_sebelum: {
      type: Sequelize.INTEGER,
    },
    stok_obat_sesudah: {
      type: Sequelize.INTEGER,
    },
    jml_obat: {
      type: Sequelize.INTEGER,
    },
  });
  
  return TransaksiObatMasuk;
};
