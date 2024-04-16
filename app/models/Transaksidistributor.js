module.exports = (sequelize, Sequelize) => {
    const Transaksidistributors = sequelize.define("transaksidistributors", {
        jml_barang: {
        type: Sequelize.INTEGER,
      },
    
     
    });
  
    return Transaksidistributors;
  };
  