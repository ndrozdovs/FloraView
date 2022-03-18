const mongoose = require("mongoose");

var nodeSchema = new mongoose.Schema({
  nodeMacAddress: String,
  codeName: String,
  data: [
    {
      temp: String,
      ph: String,
      light: String,
      moist: String,
      timestamp: String,
    },
  ],
});

module.exports = mongoose.model("Node", nodeSchema);
