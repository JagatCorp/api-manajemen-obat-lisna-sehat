const express = require("express");
const cors = require("cors");

const app = express();
app.use("/layanan", express.static("public/assets/images/layanan")); //masukkan public direktori
app.use(
  "/barangdistributor",
  express.static("public/assets/images/barangdistributor")
);
app.use("/dokter", express.static("public/assets/images/dokter"));
app.use("/obat", express.static("public/assets/images/obat"));
app.use("/nota", express.static("public/assets/images/nota"));
app.use("/qrcode", express.static("public/assets/images/qrcode"));
app.use(cors());

const db = require("./app/models");
db.sequelize
  .sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

const corsOptions = {
  origin: [
    "https://lisnasehat.online",
    "https://kop-dayalisna.online",
    "http://localhost:5000",
    "http://localhost:3000",
    // "http://192.168.1.7:3000",
  ],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Klinik Dayalisna application." });
});

require("./app/routes/administrators")(app);
require("./app/routes/auth")(app);
require("./app/routes/satuan")(app);
require("./app/routes/obat")(app);
require("./app/routes/barangdistributor")(app);
require("./app/routes/transaksiobatkeluar")(app);
require("./app/routes/transaksiobatmasuk")(app);
require("./app/routes/principle")(app);
require("./app/routes/transaksidistributor")(app);
// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
