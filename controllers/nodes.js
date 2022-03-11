const mongoose = require("mongoose");
const Node = require("../models/node");
const moment = require("moment"); // require

exports.getAllNodes = (req, res, next) => {
  Node.find()
    .select("hubMacAddress nodeMacAddress temp ph light moist timestamp _id")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        nodes: docs.map((doc) => {
          return {
            hubMacAddress: doc.hubMacAddress,
            nodeMacAddress: doc.nodeMacAddress,
            temp: doc.temp,
            ph: doc.ph,
            light: doc.light,
            moist: doc.moist,
            timestamp: doc.timestamp,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/nodes/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.getLatest = (req, res, next) => {
  Node.findOne()
    .sort({
      field: "asc",
      _id: -1,
    })
    .exec()
    .then((doc) => {
      const response = {
        nodes: doc,
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.createNode = (req, res, next) => {
  const node = new Node({
    _id: new mongoose.Types.ObjectId(),
    hubMacAddress: req.body.hubMacAddress,
    nodeMacAddress: req.body.nodeMacAddress,
    temp: req.body.temp,
    ph: req.body.ph,
    light: req.body.light,
    moist: req.body.moist,
    timestamp: moment().subtract(0, "days").format("YYYY-MM-DD HH:mm:ss"),
  });
  node
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created node successfully",
        createdNode: {
          hubMacAddress: result.hubMacAddress,
          nodeMacAddress: result.nodeMacAddress,
          temp: result.temp,
          ph: result.ph,
          light: result.light,
          moist: result.moist,
          timestamp: result.timestamp,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/nodes/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.getNode = (req, res, next) => {
  const id = req.params.id;
  console.log(req.params.id);
  Node.findById(id)
    .select("hubMacAddress nodeMacAddress temp ph light moist timestamp _id")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({ node: doc });
      } else {
        res.status(404).json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.deleteNode = (req, res, next) => {
  const id = req.params.id;
  Node.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Node deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
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
