const mongoose = require("mongoose");

var classroomSchema = new mongoose.Schema({
  macAddress: {
    type: String,
    required: true
  },
  counter: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Classroom", classroomSchema);