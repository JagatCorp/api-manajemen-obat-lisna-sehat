module.exports = (app) => {
    const satuan = require("../controllers/SatuanController");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", satuan.create);
  
    // Retrieve all Tutorials
    router.get("/", satuan.findAll);
  
    // Retrieve all published satuan
    // router.get("/published", order.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", satuan.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", satuan.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", satuan.delete);
  
    // Delete all satuan
    router.delete("/", satuan.deleteAll);
  
    app.use("/api/satuan", router);
  };
  