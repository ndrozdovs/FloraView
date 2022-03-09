const mongoose = require("mongoose");
const Profile = require("../models/profile");

module.exports.temp = async (req, res) => {
  console.log("USER SOMETHING: ", req.user)
  res.render("mainPage/pricing");
}

module.exports.newProfile = async (req, res, next) => {
  const profile = new Profile({hubMacAddress: req.body.hubMacAddress});
  console.log("USER SOMETHING: ", req.user)
  //profile.user = req.user._id;
  await profile.save();
  console.log(profile);
  res.status(200).json({ message: "Created Profile" });
};