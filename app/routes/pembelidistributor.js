module.exports = app => {
    const pembelidistributor = require("../controllers/pembelidistributorController");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", pembelidistributor.create);
  
    // Retrieve all Tutorials
    router.get("/", pembelidistributor.findAll);
  
    // Retrieve all published pembelidistributor
    // router.get("/published", pembelidistributor.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", pembelidistributor.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", pembelidistributor.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", pembelidistributor.delete);
  
    // Delete all pembelidistributor
    router.delete("/", pembelidistributor.deleteAll);
  
    app.use('/api/pembelidistributor', router);
  };