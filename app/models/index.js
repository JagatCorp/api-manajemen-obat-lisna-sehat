// models/index.js

const dbConfig = require("../configs/database.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import model yang dibutuhkan
db.satuan = require("./Satuan.js")(sequelize, Sequelize);
db.obat = require("./Obat.js")(sequelize, Sequelize);
db.layanan = require("./Layanan.js")(sequelize, Sequelize);
db.transaksi_obat_keluar = require("./TransaksiObatKeluar.js")(sequelize, Sequelize);
db.transaksi_obat_masuk = require("./TransaksiObatMasuk.js")(sequelize, Sequelize);
db.principle = require("./Principle.js")(sequelize, Sequelize);
db.administrators = require("./Administrators.js")(sequelize, Sequelize);
db.order = require("./Order.js")(sequelize, Sequelize);
db.barangdistributors = require("./Barangdistributor.js")(sequelize, Sequelize);
db.pembelidistributors = require("./Pembelidistributor.js")(
  sequelize,
  Sequelize
);
db.pasien = require("./Pasien.js")(sequelize, Sequelize);
db.transaksidistributors = require("./Transaksidistributor.js")(
  sequelize,
  Sequelize
);

// relasi table order ke layanan
db.order.belongsTo(db.layanan, { foreignKey: 'layananId' });

db.obat.belongsTo(db.satuan, { as: 'satuan_box', foreignKey: 'satuan_box_id' });
db.obat.belongsTo(db.satuan, { as: 'satuan_sat', foreignKey: 'satuan_sat_id' });

db.transaksi_obat_keluar.belongsTo(db.obat, { foreignKey: 'obat_id' });

db.transaksi_obat_masuk.belongsTo(db.obat, { foreignKey: 'obat_id' });
db.transaksi_obat_masuk.belongsTo(db.principle, { foreignKey: 'principle_id' });
db.order.belongsTo(db.layanan, { foreignKey: "layananId" });
// relasi table transaksidistributors ke barangdistributors
db.transaksidistributors.belongsTo(db.barangdistributors, {
  foreignKey: "barang_distributorId",
});
// relasi table transaksidistributors ke pembelidistributors
db.transaksidistributors.belongsTo(db.pembelidistributors, {
  foreignKey: "pembeli_distributorId",
});

// Sinkronkan model dengan database
sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

module.exports = db;
