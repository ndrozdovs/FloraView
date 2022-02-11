const express = require("express");
const router = express.Router();
const ClassroomsController = require('../controllers/classroom');

router.get("/", ClassroomsController.getAllClassrooms);

router.post("/", ClassroomsController.createClassroom);

router.get("/:id", ClassroomsController.getClassroom);

router.delete("/:id", ClassroomsController.deleteClassroom);

router.delete("/", ClassroomsController.deleteAllClassrooms);

module.exports = router;