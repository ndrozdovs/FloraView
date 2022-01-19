var mongoose = require("mongoose");

var classroomSchema = new mongoose.Schema({
  name: String,
  hubID: String,
});

var classroom = mongoose.model("Classroom", classroomSchema);

module.exports = classroom
