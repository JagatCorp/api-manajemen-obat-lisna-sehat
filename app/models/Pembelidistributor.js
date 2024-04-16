module.exports = (sequelize, Sequelize) => {
    const Pembelidistributors = sequelize.define("pembelidistributors", {
        nama_pembeli: {
        type: Sequelize.STRING,
      },
     
     
    });
  
    return Pembelidistributors;
  };
  