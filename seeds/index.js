const mongoose = require("mongoose");
const Hub = require("../models/hub");
const Node = require("../models/node");
const moment = require("moment");

mongoose.connect('mongodb://localhost:27017/FloraView');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected (seed)");
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const seedDB = async () => {
  let numberFound;
  numberFound = await Hub.countDocuments({ hubMacAddress: "94:B9:7E:D6:39:04" });

  if (numberFound === 0) {
    const newHub = new Hub({ hubMacAddress: "94:B9:7E:D6:39:04" });
    await newHub.save();
  }

  const hub = await Hub.findOne({ hubMacAddress: "94:B9:7E:D6:39:04" });
  numberFound = await Node.countDocuments({ nodeMacAddress: "seededNodeForDemo" });

  if (numberFound > 0) {
    console.log("Node already seeded, exiting")
    return
  }

  const node = new Node({ nodeMacAddress: "seededNodeForDemo", codeName: "Node " + String(hub.nodes.length + 1) });
  hub.nodes.push(node);
  await hub.save();

  let date = moment().subtract(30, "days")
  for (let i = 0; i < 2160; i++) {
    node.data.push({ 
      temp: getRandomInt(20,25), 
      ph: getRandomInt(5,10), 
      light: getRandomInt(80,100), 
      moist: getRandomInt(60,80), 
      timestamp: date.format("YYYY-MM-DD HH:mm:ss") 
    });
    date = date.add(20, 'minutes')
  }
  await node.save();
};

seedDB().then(() => {
  mongoose.connection.close();
});