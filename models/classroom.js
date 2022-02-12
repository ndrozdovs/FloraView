const mongoose = require("mongoose");

var classroomSchema = new mongoose.Schema({
  macAddress: {
    type: String,
    required: true
  },
  temp: {
    type: String,
    required: true
  },
  ph: {
    type: String,
    required: true
  },
  light: {
    type: String,
    required: true
  },
  moist: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Classroom", classroomSchema);