module.exports = (app) => {
  const dokter = require("../controllers/dokterController");
  const dokterMiddleware = require("../middleware/dokter"); // Import middleware dokter

  var router = require("express").Router();

  // Create a new dokter with image upload
  router.post("/", dokterMiddleware.single('gambar_dokter'), dokter.create); // Gunakan middleware untuk menangani upload gambar

  // Retrieve all dokter
  router.get("/", dokter.findAll);
  router.get("/transaksimedis", dokter.findTransaksiDokter);

  // Retrieve a single dokter with id
  router.get("/:id", dokter.findOne);


  // Update a dokter with id
  router.put("/:id", dokterMiddleware.single('gambar_dokter'), dokter.update);

  // Delete a dokter with id
  router.delete("/:id", dokter.delete);

  // Delete all dokter
  router.delete("/", dokter.deleteAll);

  app.use("/api/dokter", router);
};
