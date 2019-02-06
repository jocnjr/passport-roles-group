const express = require('express');
const router  = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");
const roles = require('../middlewares/roles');

router.get("/user-add", roles.checkBoss, (req, res, next) => {
  res.render("user-add");
});

router.post("/user-add", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const role = req.body.role;

  if (username == '' || password == '') {
    res.render('user-add', {
      msgError: `username and password can't be empty`
    })
    return;
  }

  User.findOne({ "username": username })
  .then(user => {
    if (user !== null) {
      res.render("user-add", {
        msgError: "The username already exists!"
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username: username,
      password: hashPass,
      name: name,
      description: description,
      profileImg: profileImg,
      role: role
    });

    newUser.save()
    .then(user => {
      res.redirect("/");
    })
    .catch(err => { throw new Error(err)});
  })
  .catch(err => { throw new Error(err)});

});


router.get("/login", (req, res, next) => {
  res.render("auth/login", {'errorMessage': req.flash('error')});
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));


router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;