module.exports = (app) => {
    const transaksi_obat_masuk = require("../controllers/transaksiobatmasukController");
    const upl_nota = require("../middleware/transaksi_obat_masuk");
    var router = require("express").Router();
  
    // Create a new Tutorial
    // Route for image upload
    router.post("/", upl_nota.single("gambar_nota"),transaksi_obat_masuk.create);
    router.post("/", transaksi_obat_masuk.create);
  
    // Retrieve all Tutorials
    router.get("/", transaksi_obat_masuk.findAll);
    // transaksi_obat_masuk.findAllHariini
    router.get("/hariini", transaksi_obat_masuk.findAllHariini);
    // transaksi_obat_masuk.findAllJatuhTempo
    router.get("/jatuh_tempo", transaksi_obat_masuk.findAllJatuhTempo);

    router.get("/delete", transaksi_obat_masuk.findAllDelete);
  
    // Retrieve all published satuan
    // router.get("/published", order.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", transaksi_obat_masuk.findOne);
  
    // Update a Tutorial with id
    // router.put("/:id", transaksi_obat_masuk.update);
    router.put("/:id", upl_nota.single("gambar_nota"),transaksi_obat_masuk.update);

    router.put("/restore/:id", transaksi_obat_masuk.restore);
  
    // Delete a Tutorial with id
    router.delete("/:id", transaksi_obat_masuk.delete);

    router.delete("/hard/:id", transaksi_obat_masuk.hardDelete);
  
    // Delete all satuan
    router.delete("/", transaksi_obat_masuk.deleteAll);
  
    app.use("/api/transaksi_obat_masuk", router);
  };
  