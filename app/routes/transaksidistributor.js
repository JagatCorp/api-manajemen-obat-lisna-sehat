module.exports = (app) => {
  const transaksidistributor = require("../controllers/transaksidistributorController");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", transaksidistributor.create);

  // Retrieve all Tutorials
  router.get("/", transaksidistributor.findAll);

  router.get("/deletelist", transaksidistributor.deleteList);

  // Retrieve all published transaksidistributor
  // router.get("/published", transaksidistributor.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/:id", transaksidistributor.findOne);

  // Update a Tutorial with id
  router.put("/:id", transaksidistributor.update);
  router.put("/restore/:id", transaksidistributor.restore);

  // Delete a Tutorial with id
  router.delete("/:id", transaksidistributor.delete);
  // Delete a Tutorial with id
  router.delete("/permanent/:id", transaksidistributor.deletePermanent);

  // Delete all transaksidistributor
  router.delete("/", transaksidistributor.deleteAll);

  app.use("/api/transaksidistributor", router);
};
