module.exports = (app) => {
  const transaksi_medis = require("../controllers/transaksimedisController");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", transaksi_medis.create);

  // Retrieve all Tutorials
  router.get("/", transaksi_medis.findAll);

  // Retrieve all published satuan
  // router.get("/published", order.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/:id", transaksi_medis.findOne);

  // Update a Tutorial with id
  router.put("/:id", transaksi_medis.update);

  // Delete a Tutorial with id
  router.delete("/:id", transaksi_medis.delete);

  // Delete all satuan
  router.delete("/", transaksi_medis.deleteAll);

  app.use("/api/transaksi_medis", router);
};
