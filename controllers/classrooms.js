const mongoose = require("mongoose");
const Classroom = require("../models/classroom");
const moment = require("moment"); // require

exports.getAllClassrooms = (req, res, next) => {
  Classroom.find()
    .select("macAddress temp ph light moist timestamp _id")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        classrooms: docs.map((doc) => {
          return {
            macAddress: doc.macAddress,
            temp: doc.temp,
            ph: doc.ph,
            light: doc.light,
            moist: doc.moist,
            timestamp: doc.timestamp,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/classrooms/" + doc._id,
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
  Classroom.findOne()
    .sort({
      field: "asc",
      _id: -1,
    })
    .exec()
    .then((doc) => {
      const response = {
        classrooms: doc,
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

exports.createClassroom = (req, res, next) => {
  const classroom = new Classroom({
    _id: new mongoose.Types.ObjectId(),
    macAddress: req.body.macAddress,
    temp: req.body.temp,
    ph: req.body.ph,
    light: req.body.light,
    moist: req.body.moist,
    timestamp: moment().subtract(0, "days").format("YYYY-MM-DD HH:mm:ss"),
  });
  classroom
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created classroom successfully",
        createdClassroom: {
          macAddress: result.macAddress,
          temp: result.temp,
          ph: result.ph,
          light: result.light,
          moist: result.moist,
          timestamp: result.timestamp,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/classrooms/" + result._id,
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

exports.getClassroom = (req, res, next) => {
  const id = req.params.id;
  console.log(req.params.id);
  Classroom.findById(id)
    .select("macAddress temp ph light moist timestamp _id")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({ classroom: doc });
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

exports.deleteClassroom = (req, res, next) => {
  const id = req.params.id;
  Classroom.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Classroom deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.deleteAllClassrooms = (req, res, next) => {
  const id = req.params.id;
  Classroom.deleteMany({})
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "All classrooms deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
