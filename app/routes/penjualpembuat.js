module.exports = app => {
  const penjualpembuat = require("../controllers/penjualpembuatController");
  const express = require('express');
  const router = express.Router();

  // Create a new Tutorial
  router.post("/", penjualpembuat.create);

  // Retrieve all Tutorials
  router.get("/", penjualpembuat.findAll);

  // Retrieve a single Tutorial with id
  router.get("/:id", penjualpembuat.findOne);

  // Update a Tutorial with id
  router.put("/:id", penjualpembuat.update);

  // Delete a Tutorial with id
  router.delete("/:id", penjualpembuat.delete);

  // Delete all penjualpembuat
  router.delete("/", penjualpembuat.deleteAll);

  app.use('/api/penjualpembuat', router);
};
