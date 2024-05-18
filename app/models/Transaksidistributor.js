module.exports = (sequelize, Sequelize) => {
    const Transaksidistributors = sequelize.define("transaksidistributors", {
        jml_barang: {
        type: Sequelize.INTEGER,
      },
      harga: {
        type: Sequelize.INTEGER,
      },
      nama_pembeli: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM("Masuk", "Keluar"),
        defaultValue: "Masuk",
      },
    },
    {
      sequelize,
      modelName: "Transaksidistributors",
      paranoid: true, // Enable soft deletes
      timestamps: true, // Enable timestamps (createdAt, updatedAt, deletedAt)
    }
  );
  
    return Transaksidistributors;
  };
  