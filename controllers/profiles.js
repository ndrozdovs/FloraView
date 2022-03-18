const mongoose = require("mongoose");
const node = require("../models/node");
const TeacherProfile = require("../models/profile");
const StudentProfile = require("../models/studentProfile");
const User = require("../models/user");
const ObjectId = require("mongodb").ObjectId;

module.exports.newProfile = async (req, res, next) => {
  const profile = new TeacherProfile({ hubMacAddress: req.body.hubMacAddress });
  profile.classrooms.push({ pairCode: req.body.pairCode });
  profile.user = req.user._id;
  await profile.save();
  res.status(200).json({ message: "Created TeacherProfile" });
};

module.exports.addGroup = async (req, res, next) => {
  const { groupName, nodes } = req.body;
  const profile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });
  profile.groups.push({ groupName: groupName, nodes: nodes });
  await profile.save();
  res.status(200).json({ message: "Updated TeacherProfile" });
};

module.exports.addPassword = async (req, res, next) => {
  const profile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });
  profile.classrooms[0].password = req.body.password;
  await profile.save();
  return true;
};

module.exports.getGroups = async (req, res, next) => {
  const profile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });
  const groupNodeData = {};
  const groupStudentsData = {};
  for (let group of profile.groups) {
    groupNodeData[group.groupName] = [];
    groupStudentsData[group.groupName] = [];

    for (let node of group.nodes) {
      groupNodeData[group.groupName].push(node);
    }
    groupStudentsData[group.groupName] = group.students;
  }

  res.send({ groupNodeData, groupStudentsData });
};

module.exports.getStudentGroups = async (req, res, next) => {
  const profile = await StudentProfile.findOne({ user: new ObjectId(req.user._id) });
  const groupNodeData = {};

  for (let group of profile.groups) {
    groupNodeData[group.groupName] = [];

    for (let node of group.nodes) {
      groupNodeData[group.groupName].push(node);
    }
  }

  res.send(groupNodeData);
};

module.exports.getStudents = async (req, res, next) => {
  const teacherProfile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });
  const students = [];

  for (let student of teacherProfile.classrooms[0].students) {
    let studentAccount = await User.findById(student._id);
    students.push(studentAccount.firstName + " " + studentAccount.lastName);
  }

  res.send(students);
};

exports.addStudent = async (req, res) => {
  const { pairCode, password } = req.body;
  const teacherProfile = await TeacherProfile.findOne({ "classrooms[0].pairCode": pairCode });

  if (teacherProfile.classrooms[0].password === password) {
    const studentProfile = new StudentProfile({
      hubMacAddress: teacherProfile.hubMacAddress,
    });

    studentProfile.user = req.user._id;
    await studentProfile.save();

    if (teacherProfile.classrooms[0].students.indexOf(studentProfile.user) == -1) {
      teacherProfile.classrooms[0].students.push(studentProfile.user);
      await teacherProfile.save();
    }

    return res.redirect("/dashboard/student");
  }

  req.flash("error", "Could not join classroom, please try again");
  return res.redirect("/dashboard/studentSetup");
};

exports.addStudentToGroup = async (req, res) => {
  const { students, groupName } = req.body;
  const teacherProfile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });

  for (let group of teacherProfile.groups) {
    if (group.groupName == groupName) {
      for (let student of students) { 
        if (group.students.indexOf(student) === -1) {
          let [first, last] = student.split(" ");
          let studentAccount = await User.findOne({ firstName: first, lastName: last });
          let studentProfile = await StudentProfile.findOne({ user: studentAccount._id });
          studentProfile.groups.push({ groupName: group.groupName, nodes: group.nodes });
  
          await studentProfile.save();
          group.students.push(student);
        }
      }
      break;
    }
  }

  await teacherProfile.save();
  res.status(200).json({ message: "Updated TeacherProfile" });
};
