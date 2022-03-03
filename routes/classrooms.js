const express = require("express");
const router = express.Router();
const ClassroomsController = require("../controllers/classrooms");

router.get("/", ClassroomsController.getAllClassrooms);

router.get("/latest", ClassroomsController.getLatest);

router.post("/", ClassroomsController.createClassroom);

router.get("/:id", ClassroomsController.getClassroom);

router.delete("/:id", ClassroomsController.deleteClassroom);

router.delete("/", ClassroomsController.deleteAllClassrooms);

module.exports = router;
