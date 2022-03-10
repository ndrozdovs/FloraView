const Profile = require('../models/profile');
var ObjectId = require("mongodb").ObjectId;

exports.renderHome = async (req, res) => {
  const profile = await Profile.findOne({user: new ObjectId(req.user._id)});
  const groupNodeData = [];
  const hubMacAddress = profile.hubMacAddress
  for(let group of profile.groups){
    groupNodeData[group.groupName] = [];
    for(let node of group.nodes){
      groupNodeData[group.groupName].push(node);
    }
  }

  res.render("dashboard/home", {hubMacAddress, groupNodeData});
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
