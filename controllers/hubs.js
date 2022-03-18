const mongoose = require("mongoose");
const Hub = require("../models/hub");
const Node = require("../models/node");
const moment = require("moment"); // require

exports.getNodeData = async (req, res, next) => {
  Node.findOne({ nodeMacAddress: req.query.nodeMacAddress })
    .then((response) => {
      return res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.getHubData = async (req, res, next) => {
  Hub.findOne({ hubMacAddress: req.query.hubMacAddress })
    .then(async function (hub) {
      let nodeData = [];
      for (let node of hub.nodes) {
        let response = await Node.findById(node);
        nodeData.push(response);
      }
      return res.status(200).json(nodeData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.getLatest = async (req, res, next) => {
  Node.findOne({ nodeMacAddress: req.query.nodeMacAddress })
  .then((response) => {
    response.data = response.data[response.data.length - 1];
    return res.status(200).json(response);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({ error: err });
  });
};

exports.getLatestHubData = async (req, res, next) => {
  Hub.findOne({ hubMacAddress: req.query.hubMacAddress })
    .then(async function (hub) {
      let nodeData = [];
      for (let node of hub.nodes) {
        let response = await Node.findById(node);
        response.data = response.data[response.data.length - 1];
        nodeData.push(response);
      }
      return res.status(200).json(nodeData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.getAvailableNodes = async (req, res, next) => {
  Hub.findOne({ hubMacAddress: req.query.hubMacAddress })
    .then(async function (hub) {
      let nodeList = [];
      for (let node of hub.nodes) {
        let response = await Node.findById(node);
        nodeList.push({ nodeMacAddress: response.nodeMacAddress, codeName: response.codeName });
      }
      return res.status(200).json(nodeList);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.addNodeData = async (req, res, next) => {
  let numberFound;
  numberFound = await Hub.countDocuments({ hubMacAddress: req.body.hubMacAddress });

  if (numberFound === 0) {
    const newHub = new Hub({ hubMacAddress: req.body.hubMacAddress });
    await newHub.save();
  }

  const hub = await Hub.findOne({ hubMacAddress: req.body.hubMacAddress });

  numberFound = await Node.countDocuments({ nodeMacAddress: req.body.nodeMacAddress });

  if (numberFound === 0) {
    const newNode = new Node({ nodeMacAddress: req.body.nodeMacAddress, codeName: "Node " + String(hub.nodes.length + 1) });
    await newNode.save();
  }

  const node = await Node.findOne({ nodeMacAddress: req.body.nodeMacAddress });
  node.data.push({ temp: req.body.temp, ph: req.body.ph, light: req.body.light, moist: req.body.moist, timestamp: moment().subtract(0, "days").format("YYYY-MM-DD HH:mm:ss") });
  await node.save();

  if (hub.nodes.indexOf(node._id) == -1) {
    hub.nodes.push(node);
    await hub.save();
  }

  res.status(201).json({ message: "Added data successfully" });
};
