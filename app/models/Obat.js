// const { Layanan } = require("./Layanan");
// Mengimpor Layanan dari db
// Assuming Layanan.js is in the same directory

const sequelize = require("../configs/database");
const { Model } = require("sequelize");
class Obat extends Model {}

module.exports = (sequelize, Sequelize) => {
  const Obat = sequelize.define("obat", {
    nama_obat: {
      type: Sequelize.STRING,
    },
    qty_box: {
      type: Sequelize.INTEGER,
    },
    // satuan_box fk satuan
    qty_sat: {
        type: Sequelize.INTEGER,
    },
    // satuan_sat fk satuan
    stok: {
      type: Sequelize.INTEGER,
    },
    harga: {
      type: Sequelize.INTEGER,
    },
    gambar_obat: {
      type: Sequelize.STRING,
    },
    urlGambar: {
      type: Sequelize.STRING,
    },
  });
  
  return Obat;
};
