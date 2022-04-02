const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    console.log(req.originalUrl) // '/admin/new?a=b' (WARNING: beware query string)
    console.log(req.baseUrl) // '/admin'
    console.log(req.path) // '/new'
    console.log(req.baseUrl + req.path)
    const { username, firstName, lastName, email, password, account } = req.body;
    const user = new User({ email, account, firstName, lastName, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      res.redirect("/dashboard");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  console.log(req.originalUrl) // '/admin/new?a=b' (WARNING: beware query string)
  console.log(req.baseUrl) // '/admin'
  console.log(req.path) // '/new'
  console.log(req.baseUrl + req.path)
  res.redirect("/dashboard");
};

module.exports.logout = (req, res) => {
  req.logout();
  res.redirect("/");
};
