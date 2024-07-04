module.exports = (sequelize, Sequelize) => {
  const Barangdistributors = sequelize.define("barangdistributors", {
    nama_distributor: {
      type: Sequelize.STRING,
    }
  });

  return Barangdistributors;
};
