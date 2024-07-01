module.exports = (app) => {
  const obat = require("../controllers/obatController");
  const upl_obat = require("../middleware/obat");

  var router = require("express").Router();
  // Route for image upload
  router.post("/", upl_obat.single("gambar_obat"), obat.create);
  // Create a new Tutorial
  router.post("/", obat.create);

  // Retrieve all Tutorials
  router.get("/", obat.findAll);
  router.post("/data", obat.findExcel);
  // untuk chart perminggu
  router.get("/chart", obat.chart);
  // Retrieve all published obat
  // router.get("/published", order.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/:id", obat.findOne);


  // Update a Tutorial with id
  // router.put("/:id", obat.update);
  router.put("/:id", upl_obat.single("gambar_obat"), obat.update);

  // Delete a Tutorial with id
  router.delete("/:id", obat.delete);

  // Delete all obat
  router.delete("/", obat.deleteAll);

  app.use("/api/obat", router);
};
