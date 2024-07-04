// const { Layanan } = require("./Layanan");
// Mengimpor Layanan dari db
// Assuming Layanan.js is in the same directory

const sequelize = require("../configs/database");
const { Model } = require("sequelize");
class PenjualPembuat extends Model {}

module.exports = (sequelize, Sequelize) => {
  const PenjualPembuat = sequelize.define("penjualpembuat", {
    
  });
  
  
  return PenjualPembuat;
};
