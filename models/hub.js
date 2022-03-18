const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var hubSchema = new mongoose.Schema({
  hubMacAddress: String,
  nodes: [{
    type: Schema.Types.ObjectId,
    ref: "Node",
  }],
});

module.exports = mongoose.model("Hub", hubSchema);
