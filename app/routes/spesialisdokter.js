module.exports = (app) => {
    const spesialisdokter = require("../controllers/spesialisdokterController");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", spesialisdokter.create);
  
    // Retrieve all Tutorials
    router.get("/", spesialisdokter.findAll);
  
    // Retrieve all published satuan
    // router.get("/published", order.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", spesialisdokter.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", spesialisdokter.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", spesialisdokter.delete);
  
    // Delete all satuan
    router.delete("/", spesialisdokter.deleteAll);
  
    app.use("/api/spesialis_dokter", router);
  };
  