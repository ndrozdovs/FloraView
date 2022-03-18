const mongoose = require("mongoose");
const Hub = require("../models/hub");
const Node = require("../models/node");
const moment = require("moment"); // require

exports.getHub = async (req, res, next) => {
  Hub.findOne({ hubMacAddress: req.query.hubMacAddress })
  .then((hub) =>{
    Node.findById(hub.nodes[0])
    .then((node) => {
      return res.status(200).json(node)
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({error: err});
    });
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({error: err});
  });
};

exports.getLatest = async (req, res, next) => {
  Hub.findOne({ hubMacAddress: req.query.hubMacAddress })
  .then((hub) =>{
    Node.findById(hub.nodes[0])
    .then((response) => {
      response.data = response.data[response.data.length - 1]
      return res.status(200).json(response)
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({error: err});
    });
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({error: err});
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
    const newNode = new Node({ nodeMacAddress: req.body.nodeMacAddress });
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

exports.deleteAllNodes = (req, res, next) => {
  const id = req.params.id;
  Node.deleteMany({})
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "All nodes deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
