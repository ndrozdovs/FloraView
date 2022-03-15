const TeacherProfile = require('../models/profile');
const StudentProfile = require('../models/studentProfile');
var ObjectId = require("mongodb").ObjectId;

exports.renderHome = async (req, res) => {
  const profile = await TeacherProfile.findOne({user: new ObjectId(req.user._id)});
  const groupNodeData = [];
  const hubMacAddress = profile.hubMacAddress
  const classrooms = profile.classrooms
  for(let group of profile.groups){
    groupNodeData[group.groupName] = [];
    for(let node of group.nodes){
      groupNodeData[group.groupName].push(node);
    }
  }

  res.render("dashboard/home", {hubMacAddress, groupNodeData, classrooms});
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
  const profile = await StudentProfile.findOne({user: new ObjectId(req.user._id)});
  const hubMacAddress = profile.hubMacAddress
  const groupName = profile.groupName;
  const nodes = profile.nodes

  res.render("dashboard/student", {hubMacAddress, groupName, nodes});
};
