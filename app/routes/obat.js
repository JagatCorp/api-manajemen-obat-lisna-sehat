module.exports = (app) => {
    const obat = require("../controllers/obatController");
    const upl_obat = require('../middleware/obat');

    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", obat.create);
  
    // Retrieve all Tutorials
    router.get("/", obat.findAll);
  
    // Retrieve all published obat
    // router.get("/published", order.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", obat.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", obat.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", obat.delete);
  
    // Delete all obat
    router.delete("/", obat.deleteAll);
  
    app.use("/api/obat", router);
  };
  