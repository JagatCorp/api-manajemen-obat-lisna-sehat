// const { Layanan } = require("./Layanan");
// Mengimpor Layanan dari db
// Assuming Layanan.js is in the same directory

const sequelize = require("../configs/database");
const { Model } = require("sequelize");
class TransaksiObatMasuk extends Model {}

module.exports = (sequelize, Sequelize) => {
  const Principle = sequelize.define("principle", {
    // id
    nama_instansi: {
      type: Sequelize.STRING,
    },
  });
  
  return Principle;
};
