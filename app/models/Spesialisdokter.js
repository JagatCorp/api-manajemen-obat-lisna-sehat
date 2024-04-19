module.exports = (sequelize, Sequelize) => {
  const Spesialisdokter = sequelize.define("spesialisdokters", {
    nama_spesialis: {
      type: Sequelize.STRING,
    },
    harga: {
      type: Sequelize.INTEGER,
    },
    is_dokter_gigi: {
      type: Sequelize.BOOLEAN,
    },
  });

  return Spesialisdokter;
};
