const express = require("express");
const router = express.Router();
const dashboardPages = require("../controllers/dashboard");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isTeacher, isStudent, profileCreated, setupCompleted, studentSetupCompleted, studentProfileCreated } = require("../middleware");

router.get("/", isLoggedIn, isTeacher, profileCreated, dashboardPages.renderHome);

router.get("/setup", isLoggedIn, isTeacher, setupCompleted, dashboardPages.renderSetup);

router.get("/guide", isLoggedIn, dashboardPages.renderGuide);

router.get("/support", isLoggedIn, dashboardPages.renderSupport);

router.get("/studentSetup", isLoggedIn, isStudent, studentSetupCompleted, dashboardPages.renderStudentSetup);

router.get("/student", isLoggedIn, isStudent, studentProfileCreated, dashboardPages.renderStudent);

module.exports = router;
