const mongoose = require("mongoose");

var classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hubId: {
    type: String,
    required: true
  },
});

const Classroom = mongoose.model("Classroom", classroomSchema);

module.exports = Classroom
