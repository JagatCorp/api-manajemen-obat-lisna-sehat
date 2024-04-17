module.exports = (app) => {
    const transaksi_obat_keluar = require("../controllers/transaksiobatkeluarController");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", transaksi_obat_keluar.create);
  
    // Retrieve all Tutorials
    router.get("/", transaksi_obat_keluar.findAll);
  
    // Retrieve all published satuan
    // router.get("/published", order.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", transaksi_obat_keluar.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", transaksi_obat_keluar.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", transaksi_obat_keluar.delete);
  
    // Delete all satuan
    router.delete("/", transaksi_obat_keluar.deleteAll);
  
    app.use("/api/transaksi_obat_keluar", router);
  };
  