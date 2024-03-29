const TeacherProfile = require("../models/profile");
const StudentProfile = require("../models/studentProfile");
var ObjectId = require("mongodb").ObjectId;

exports.renderHome = async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });
    const groupNodeData = [];
    const groupStudentsData = [];
    const hubMacAddress = profile.hubMacAddress;
    const classrooms = profile.classrooms;
    for (let group of profile.groups) {
      groupNodeData[group.groupName] = [];
      groupStudentsData[group.groupName] = [];
      for (let node of group.nodes) {
        groupNodeData[group.groupName].push(node);
      }
      groupStudentsData[group.groupName] = group.students;
    }

    res.render("dashboard/home", { hubMacAddress, groupNodeData, groupStudentsData, classrooms });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.renderSetup = (req, res) => {
  res.render("dashboard/setup");
};

exports.renderGuide = (req, res) => {
  res.render("dashboard/guide");
};

exports.renderSupport = (req, res) => {
  res.render("dashboard/support");
};

exports.renderStudentSetup = (req, res) => {
  res.render("dashboard/studentSetup");
};

exports.renderStudent = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: new ObjectId(req.user._id) });
    const hubMacAddress = profile.hubMacAddress;
    let groups = [];
    for (let group of profile.groups) {
      groups.push(group.groupName);
    }

    res.render("dashboard/student", { hubMacAddress, groups });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
