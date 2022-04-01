const express = require("express");
const router = express.Router();
const ProfilesController = require("../controllers/profiles");
const { isLoggedIn, isStudent } = require("../middleware");

router.post("/", isLoggedIn, ProfilesController.newProfile);

router.post("/addGroup", ProfilesController.addGroup);

router.post("/addPassword", isLoggedIn, ProfilesController.addPassword);

router.get("/getGroups", ProfilesController.getGroups);

router.get("/getStudentGroups", isLoggedIn, isStudent, ProfilesController.getStudentGroups);

router.get("/getStudents", isLoggedIn, ProfilesController.getStudents);

router.post("/addStudent", isLoggedIn, isStudent, ProfilesController.addStudent);

router.post("/addStudentsToGroup", isLoggedIn, ProfilesController.addStudentToGroup);

module.exports = router;