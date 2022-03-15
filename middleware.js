const TeacherProfile = require("./models/profile");
const StudentProfile = require("./models/studentProfile");
var ObjectId = require("mongodb").ObjectId;

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.isTeacher = (req, res, next) => {
  if(req.user.account !== "Teacher"){
    return res.redirect("/dashboard/studentSetup");
  }
  next();
};

module.exports.isStudent = (req, res, next) => {
  if(req.user.account !== "Student"){ 
    return res.redirect("/dashboard");
  }
  next();
};

module.exports.profileCreated = async (req, res, next) => {
  TeacherProfile.countDocuments({user: new ObjectId(req.user._id)}, function (err, count){
    if(count === 0){
      return res.redirect("/dashboard/setup");
    }
    next();
  })
};

module.exports.setupCompleted = async (req, res, next) => {
  TeacherProfile.countDocuments({user: new ObjectId(req.user._id)}, function (err, count){
    if(count === 1){
      return res.redirect("/dashboard");
    }
    next();
  })
};

module.exports.studentProfileCreated = async (req, res, next) => {
  StudentProfile.countDocuments({user: new ObjectId(req.user._id)}, function (err, count){
    if(count === 0){
      return res.redirect("/dashboard/studentSetup");
    }
    next();
  })
};

module.exports.studentSetupCompleted = async (req, res, next) => {
  StudentProfile.countDocuments({user: new ObjectId(req.user._id)}, function (err, count){
    if(count === 1){
      return res.redirect("/dashboard/student");
    }
    next();
  })
};
