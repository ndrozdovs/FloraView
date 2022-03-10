const mongoose = require("mongoose");

var nodeSchema = new mongoose.Schema({
  hubMacAddress: {
    type: String,
    required: false,
  },
  nodeMacAddress: {
    type: String,
    required: false,
  },
  ph: {
    type: String,
    required: false,
  },
  light: {
    type: String,
    required: false,
  },
  moist: {
    type: String,
    required: false,
  },
  timestamp: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Node", nodeSchema);
