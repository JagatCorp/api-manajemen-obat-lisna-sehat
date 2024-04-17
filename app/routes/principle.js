module.exports = (app) => {
    const principle = require("../controllers/principleController");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", principle.create);
  
    // Retrieve all Tutorials
    router.get("/", principle.findAll);
  
    // Retrieve all published satuan
    // router.get("/published", order.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", principle.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", principle.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", principle.delete);
  
    // Delete all satuan
    router.delete("/", principle.deleteAll);
  
    app.use("/api/principle", router);
  };
  