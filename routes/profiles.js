const express = require("express");
const router = express.Router();
const ProfilesController = require("../controllers/profiles");
const { isLoggedIn } = require("../middleware");

router.post("/", isLoggedIn, ProfilesController.newProfile);

router.post("/addGroup", isLoggedIn, ProfilesController.addGroup);

router.get("/getGroups", isLoggedIn, ProfilesController.getGroups);

module.exports = router;