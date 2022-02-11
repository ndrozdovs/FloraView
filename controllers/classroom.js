const mongoose = require("mongoose");
const Classroom = require("../models/classroom");

exports.getAllClassrooms = (req, res, next) => {
  Classroom.find()
    .select("macAddress counter timestamp _id")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        classrooms: docs.map(doc => {
          return {
            macAddress: doc.macAddress,
            counter: doc.counter,
            timestamp: doc.timestamp,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/classrooms/" + doc._id
            }
          };
        })
      };
			res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.createClassroom = (req, res, next) => {
	const classroom = new Classroom(req.body)
  classroom
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created classroom successfully",
        createdClassroom: {
          macAddress: result.macAddress,
          counter: result.counter,
          timestamp: result.timestamp,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/classrooms/" + result._id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.getClassroom = (req, res, next) => {
  const id = req.params.id;
	console.log(req.params.id)
  Classroom.findById(id)
		.select("macAddress counter timestamp _id")
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          classroom: doc,
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.deleteClassroom = (req, res, next) => {
  const id = req.params.id;
  Classroom.deleteOne({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Classroom deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/products",
          body: { name: "String", price: "Number" }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};