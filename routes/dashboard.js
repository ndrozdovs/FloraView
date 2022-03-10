const express = require("express");
const router = express.Router();
const dashboardPages = require("../controllers/dashboard");
const { isLoggedIn, profileCreated, setupCompleted } = require("../middleware");

router.get("/", isLoggedIn, profileCreated, dashboardPages.renderHome);

router.get("/setup", isLoggedIn, setupCompleted, dashboardPages.renderSetup);

router.get("/guide", isLoggedIn, dashboardPages.renderGuide);

router.get("/support", isLoggedIn, dashboardPages.renderSupport);

module.exports = router;
