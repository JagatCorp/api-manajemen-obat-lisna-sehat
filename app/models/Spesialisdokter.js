const sequelize = require("../configs/database");
const { Model } = require("sequelize");
class Spesialisdokter extends Model {}

module.exports = (sequelize, Sequelize) => {
    const Spesialisdokter = sequelize.define("spesialis_dokter", {
        nama_spesialis: {
            type: Sequelize.STRING,
        },
        harga: {
            type: Sequelize.INTEGER,
        },
        is_dokter_gigi: {
            type: Sequelize.BOOLEAN,
        }
    });

    return Spesialisdokter;
}


