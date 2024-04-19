module.exports = (app) => {
    const dokter = require("../controllers/dokterController");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", dokter.create);
  
    // Retrieve all Tutorials
    router.get("/", dokter.findAll);
  
    // Retrieve all published dokter
    // router.get("/published", order.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", dokter.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", dokter.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", dokter.delete);
  
    // Delete all dokter
    router.delete("/", dokter.deleteAll);
  
    app.use("/api/dokter", router);
  };
  