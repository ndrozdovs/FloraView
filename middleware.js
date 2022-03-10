const Profile = require("./models/profile");
var ObjectId = require("mongodb").ObjectId;

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.profileCreated = async (req, res, next) => {
  Profile.countDocuments({user: new ObjectId(req.user._id)}, function (err, count){
    if(count === 0){
      return res.redirect("/dashboard/setup");
    }
    next();
  })
};

module.exports.setupCompleted = async (req, res, next) => {
  Profile.countDocuments({user: new ObjectId(req.user._id)}, function (err, count){
    if(count === 1){
      return res.redirect("/dashboard");
    }
    next();
  })
};
