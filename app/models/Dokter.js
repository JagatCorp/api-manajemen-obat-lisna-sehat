const sequelize = require("../configs/database");
const { Model } = require("sequelize");
class Dokter extends Model {}

module.exports = (sequelize, Sequelize) => {
  const Dokter = sequelize.define("dokter", {
    nama_dokter: {
      type: Sequelize.STRING,
    },
    jk: {
      type: Sequelize.ENUM("L", "P"),
    },
    mulai_praktik: {
      type: Sequelize.TIME,
    },
    selesai_praktik: {
      type: Sequelize.TIME,
    },
    hari_praktik: {
      type: Sequelize.STRING,
    },
    // spesialis_dokter_id, FK table spesialis_dokter
    gambar_dokter: {
      type: Sequelize.STRING,
    },
    urlGambar: {
      type: Sequelize.STRING,
    },
    username: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
  });

  return Dokter;
};
