const express = require("express");
const router = express.Router();
const NodesController = require("../controllers/nodes");

router.get("/", NodesController.getAllNodes);

router.get("/latest", NodesController.getLatest);

router.post("/", NodesController.createNode);

router.get("/:id", NodesController.getNode);

router.delete("/:id", NodesController.deleteNode);

router.delete("/", NodesController.deleteAllNodes);

module.exports = router;
