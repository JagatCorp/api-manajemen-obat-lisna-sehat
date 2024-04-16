// const { Layanan } = require("./Layanan");
// Mengimpor Layanan dari db
// Assuming Layanan.js is in the same directory

const sequelize = require("../configs/database");
const { Model } = require("sequelize");
class Satuan extends Model {}

module.exports = (sequelize, Sequelize) => {
  const Satuan = sequelize.define("satuan", {
    nama_instansi: {
      type: Sequelize.STRING,
    },
  });
  
  return Satuan;
};
