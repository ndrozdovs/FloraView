const Hub = require("../models/hub");
const Node = require("../models/node");
const moment = require("moment"); // require

let mySocket;

// Controller agrees to implement the function called "respond"
module.exports.respond = function(socket_io){
  mySocket = socket_io
}

exports.getNodeData = async (req, res, next) => {
  try {
    const node = await Node.findOne({ nodeMacAddress: req.query.nodeMacAddress })
    return res.status(200).json(node);
  } catch (err) {
    console.log(err)
    res.status(500).json({});
  }
};

exports.getHubData = async (req, res, next) => {
  try {
    const hub = await Hub.findOne({ hubMacAddress: req.query.hubMacAddress })
    let nodeData = [];
    for (let node of hub.nodes) {
      let response = await Node.findById(node);
      nodeData.push(response);
    }
    return res.status(200).json(nodeData);
  } catch (err) {
    console.log(err)
    res.status(500).json({});
  }
};

exports.getAvailableNodes = async (req, res, next) => {
  try {
    const hub = await Hub.findOne({ hubMacAddress: req.query.hubMacAddress })
    let nodeList = [];
    if(hub === null){
      return res.status(200).json([]);
    }
    for (let node of hub.nodes) {
      let response = await Node.findById(node);
      nodeList.push({ nodeMacAddress: response.nodeMacAddress, codeName: response.codeName });
    }
    return res.status(200).json(nodeList);
  } catch (err) {
    console.log(err)
    res.status(500).json({});
  }
};

function getRandomFloat(min, max, decimals) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);

  return parseFloat(str);
}

exports.addNodeData = async (req, res, next) => {
  try {
    if(req.query.hubMacAddress.length === 0){
      console.log("No Hub macAddress, data not added, exiting")
      return;
    }
    let numberFound;
    numberFound = await Hub.countDocuments({ hubMacAddress: req.query.hubMacAddress });
  
    if (numberFound === 0) {
      const newHub = new Hub({ hubMacAddress: req.query.hubMacAddress });
      await newHub.save();
    }
  
    const hub = await Hub.findOne({ hubMacAddress: req.query.hubMacAddress });
  
    numberFound = await Node.countDocuments({ nodeMacAddress: req.query.nodeMacAddress });
  
    if (numberFound === 0) {
      const newNode = new Node({ nodeMacAddress: req.query.nodeMacAddress, codeName: "Node " + String(hub.nodes.length + 1) });
      await newNode.save();
    }

    const node = await Node.findOne({ nodeMacAddress: req.query.nodeMacAddress });

    if (req.query.light === "-1234.12"){
      var light
      if(node.data.length === 0){
        req.query.light = 500
      }
      else{
        light = parseInt(node.data[node.data.length - 1].light)
        req.query.light = String(light + getRandomFloat(-50,50, 2))
      }
      console.log("FloraView: ", moment().subtract(0, "days").format("YYYY-MM-DD HH:mm:ss"))
    }
    if (req.query.temp === "-1234.12"){
      var temp
      if(node.data.length === 0){
        req.query.temp = 22
      }
      else{
        var temp =  parseInt(node.data[node.data.length - 1].temp)
        req.query.temp = String(temp + getRandomFloat(-0.2, 0.2, 2))
      }
      console.log("Floraview: ", moment().subtract(0, "days").format("YYYY-MM-DD HH:mm:ss"))
    }

    req.query.ph = String(parseInt(req.query.ph) + getRandomFloat(-0.2, 0.2, 2))
  
    const node = await Node.findOne({ nodeMacAddress: req.body.nodeMacAddress });
    node.data.push({ temp: req.query.temp, ph: req.query.ph, light: req.query.light, moist: req.query.moist, timestamp: moment().subtract(0, "days").format("YYYY-MM-DD HH:mm:ss") });
    await node.save();
  
    if (hub.nodes.indexOf(node._id) == -1) {
      hub.nodes.push(node);
      await hub.save();
    }

    if (typeof mySocket !== "undefined") {
      mySocket.emit('newData', { hubMacAddress: req.query.hubMacAddress, nodeMacAddress: req.query.nodeMacAddress, temp: req.query.temp, ph: req.query.ph, light: req.query.light, moist: req.query.moist, timestamp: moment().subtract(0, "days").format("YYYY-MM-DD HH:mm:ss") })
      mySocket.emit('newDataAll', { hubMacAddress: req.query.hubMacAddress, nodeMacAddress: req.query.nodeMacAddress, temp: req.query.temp, ph: req.query.ph, light: req.query.light, moist: req.query.moist, timestamp: moment().subtract(0, "days").format("YYYY-MM-DD HH:mm:ss") })
    }

    res.status(201).json({ message: "Added data successfully" });
  } catch (err) {
    console.log(err)
    res.status(500).json({});
  }
};
