const express = require("express");
const router = express.Router();
const ClassroomsController = require('../controllers/classroom');

router.get("/", ClassroomsController.getAllClassrooms);

router.post("/", ClassroomsController.createClassroom);

router.get("/:id", ClassroomsController.getClassroom);

router.delete("/:id", ClassroomsController.deleteClassroom);

module.exports = router;