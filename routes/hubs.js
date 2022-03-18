const express = require("express");
const router = express.Router();
const HubsController = require("../controllers/hubs");

router.get("/", HubsController.getHub);

router.get("/latest", HubsController.getLatest);

router.get("/nodes", HubsController.getAvailableNodes);

router.post("/", HubsController.addNodeData);

router.delete("/", HubsController.deleteAllNodes);

module.exports = router;
