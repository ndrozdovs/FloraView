const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  hubMacAddress: String,
  groups: [
    {
      groupName: { type: String },
      nodes: [
        {
          macAddress: String,
          codeName: String,
        },
      ],
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  node: {
    type: Schema.Types.ObjectId,
    ref: "Node",
  },
});

module.exports = mongoose.model("StudentProfile", profileSchema);
