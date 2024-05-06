module.exports = (sequelize, Sequelize) => {
  const Pasien = sequelize.define("pasien", {
    nama: {
      type: Sequelize.STRING,
    },

    alamat: {
      type: Sequelize.STRING,
    },
    jk: {
      type: Sequelize.ENUM("L", "P"),
    },

    no_telp: {
      type: Sequelize.STRING,
    },
    alergi: {
      type: Sequelize.STRING,
    },
    tgl_lahir: {
      type: Sequelize.DATE,
    },
    gol_darah: {
      type: Sequelize.STRING,
    },
    username: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
  });

  return Pasien;
};
