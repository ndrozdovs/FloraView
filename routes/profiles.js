const express = require("express");
const router = express.Router();
const ProfilesController = require("../controllers/profiles");

router.get("/", ProfilesController.temp)
router.post("/", ProfilesController.newProfile);

module.exports = router;