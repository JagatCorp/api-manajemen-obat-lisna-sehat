module.exports = (sequelize, Sequelize) => {
  const Barangdistributors = sequelize.define("barangdistributors", {
    nama_barang: {
      type: Sequelize.STRING,
    },
    harga_satuan_barang: {
      type: Sequelize.STRING,
    },
    gambar: {
      type: Sequelize.STRING,
    },
    urlGambar: {
      type: Sequelize.STRING,
    },
    satuan_stok_barang: {
      type: Sequelize.INTEGER,
    },
  });

  return Barangdistributors;
};
