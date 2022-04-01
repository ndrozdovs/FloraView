const TeacherProfile = require("../models/profile");
const StudentProfile = require("../models/studentProfile");
const User = require("../models/user");
const ObjectId = require("mongodb").ObjectId;

module.exports.newProfile = async (req, res, next) => {
  try {
    const profile = new TeacherProfile({ hubMacAddress: req.body.hubMacAddress });
    profile.classrooms.push({ pairCode: req.body.pairCode });
    profile.user = req.user._id;
    await profile.save();
    return res.status(200).json({ message: "Created TeacherProfile" });
  } catch (err) {
    console.log(err)
    res.status(500).json({});
  }
};

module.exports.addGroup = async (req, res, next) => {
  try {
    console.log("ADDED NEW GROUP")
    const { groupName, nodes } = req.body;
    const profile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });
    profile.groups.push({ groupName: groupName, nodes: nodes });
    await profile.save();
    return res.status(200).json({ message: "Added group to Teacher profile" });
  } catch (err) {
    console.log(err)
    res.status(500).json({});
  }
};

module.exports.addPassword = async (req, res, next) => {
  try {
    const profile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });
    profile.classrooms[0].password = req.body.password;
    await profile.save();
    return res.status(200).json({ message: "Added password for Teacher classroom" });
  } catch (err) {
    console.log(err)
    res.status(500).json({});
  }
};

module.exports.getGroups = async (req, res, next) => {
  try {
    console.log("getGroups")
    console.log(req.user._id)
    const profile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });
    console.log(profile)
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

    return res.status(200).json({ groupNodeData, groupStudentsData });
  } catch (err) {
    console.log(err)
    res.status(500).json({});
  }
};

module.exports.getStudentGroups = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: new ObjectId(req.user._id) });
    const groupNodeData = {};
  
    for (let group of profile.groups) {
      groupNodeData[group.groupName] = [];
  
      for (let node of group.nodes) {
        groupNodeData[group.groupName].push(node);
      }
    }
  
    return res.status(200).json(groupNodeData);
  } catch (err) {
    console.log(err)
    res.status(500).json({});
  }
};

module.exports.getStudents = async (req, res, next) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });
    const students = [];
  
    for (let student of teacherProfile.classrooms[0].students) {
      let studentAccount = await User.findById(student._id);
      students.push(studentAccount.firstName + " " + studentAccount.lastName);
    }
  
    return res.status(200).json(students);
  } catch (err) {
    console.log(err)
    res.status(500).json({});
  }
};

module.exports.addStudent = async (req, res) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({ "classrooms.pairCode": req.body.classroom });
  
    if (teacherProfile !== null && teacherProfile.classrooms[0].password === req.body.password) {
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
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports.addStudentToGroup = async (req, res) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({ user: new ObjectId(req.user._id) });
  
    for (let group of teacherProfile.groups) {
      if (group.groupName == req.body.groupName) {
        for (let student of req.body.students) {
          if (group.students.indexOf(student) === -1) {
            let [first, last] = student.split(" ");

            let studentAccount = await User.findOne({ firstName: first, lastName: last });
            let studentProfile = await StudentProfile.findOne({ user: studentAccount._id })
            studentProfile.groups.push({ groupName: group.groupName, nodes: group.nodes });
            group.students.push(student);
            await studentProfile.save();
          }
        }
        break;
      }
    }
    
    await teacherProfile.save()
    res.status(200).json({ message: "Added students to Teacher's group" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
