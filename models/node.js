const mongoose = require("mongoose");

var nodeSchema = new mongoose.Schema({
  hubMacAddress: {
    type: String,
    required: true,
  },
  nodeMacAddress: {
    type: String,
    required: true,
  },
  ph: {
    type: String,
    required: true,
  },
  light: {
    type: String,
    required: true,
  },
  moist: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Node", nodeSchema);
