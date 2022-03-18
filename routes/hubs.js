const express = require("express");
const router = express.Router();
const HubsController = require("../controllers/hubs");

router.get("/", HubsController.getNodeData);

router.get("/hub", HubsController.getHubData);

router.get("/latest", HubsController.getLatest);

router.get("/latestHubData", HubsController.getLatestHubData);

router.get("/nodes", HubsController.getAvailableNodes);

router.post("/", HubsController.addNodeData);

module.exports = router;
