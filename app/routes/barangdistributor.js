module.exports = app => {
    const barangdistributor = require("../controllers/barangdistributorController");
    const express = require('express');
  const router = express.Router();
    const upl_barangdistributor = require('../middleware/barangdistributor');

    // Create a new Tutorial
    router.post("/", upl_barangdistributor.single('gambar'), barangdistributor.create);
  
    // Retrieve all Tutorials
    router.get("/", barangdistributor.findAll);
  
    // Retrieve all published barangdistributor
    // router.get("/published", barangdistributor.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", barangdistributor.findOne);
  
    // Update a Tutorial with id
    router.put("/:id",upl_barangdistributor.single('gambar'), barangdistributor.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", barangdistributor.delete);
  
    // Delete all barangdistributor
    router.delete("/", barangdistributor.deleteAll);
  
    app.use('/api/barangdistributor', router);
  };