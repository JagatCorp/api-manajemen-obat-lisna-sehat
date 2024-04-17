module.exports = app => {
    const pasien = require("../controllers/pasienController");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", pasien.create);
  
    // Retrieve all Tutorials
    router.get("/", pasien.findAll);
  
    // Retrieve all published pasien
    // router.get("/published", pasien.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", pasien.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", pasien.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", pasien.delete);
  
    // Delete all pasien
    router.delete("/", pasien.deleteAll);
  
    app.use('/api/pasien', router);
  };