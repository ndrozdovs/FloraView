const mongoose = require("mongoose");
const Profile = require("../models/profile");
const ObjectId = require("mongodb").ObjectId;

module.exports.newProfile = async (req, res, next) => {
  const profile = new Profile({hubMacAddress: req.body.hubMacAddress});
  profile.user = req.user._id;
  await profile.save();
  res.status(200).json({ message: "Created Profile" });
};

module.exports.addGroup = async (req, res, next) => {
  const {groupName, nodes} = req.body
  const profile = await Profile.findOne({user: new ObjectId(req.user._id)});
  profile.groups.push({groupName:groupName, nodes:nodes})
  await profile.save();
  res.status(200).json({ message: "Updated Profile" });
};

module.exports.getGroups = async (req, res, next) => {
  const profile = await Profile.findOne({user: new ObjectId(req.user._id)});
  const groupNodeData = {};
  for(let group of profile.groups){
    groupNodeData[group.groupName] = [];
    for(let node of group.nodes){
      groupNodeData[group.groupName].push(node);
    }
  }
  
  res.send(groupNodeData)
};
