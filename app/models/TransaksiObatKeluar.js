// const { Layanan } = require("./Layanan");
// Mengimpor Layanan dari db
// Assuming Layanan.js is in the same directory

const sequelize = require("../configs/database");
const { Model } = require("sequelize");
class TransaksiObatKeluar extends Model {}

module.exports = (sequelize, Sequelize) => {
  const TransaksiObatKeluar = sequelize.define("transaksi_obat_keluar", {
    // id
    // obat_id, foreign obat
    // transaksi_medis_pasien, foreign transaksi medis pasien
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
  
  return TransaksiObatKeluar;
};
