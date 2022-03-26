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
  numberFound = await Hub.countDocuments({ hubMacAddress: "94:B9:7E:D6:39:04" }); // Change this Hub macAddress to whatever is the desired Hub
  if (numberFound > 0){
    return;
  }
  const node = new Node({ nodeMacAddress: "thisIs17Character", codeName: "Node 420" }); // Change this Node macAddress to whatever is the desired Node
  await node.save();
  const hub = new Hub({ hubMacAddress: "94:B9:7E:D6:39:04" }); // Change this Hub macAddress to whatever is the desired Hub
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
