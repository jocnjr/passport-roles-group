const express = require('express');
const router  = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");
const roles = require('../middlewares/roles');


router.get("/login", (req, res, next) => {
  res.render("auth/login", {'errorMessage': req.flash('error')});
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/users",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/users/add", roles.checkBoss, (req, res, next) => {
  res.render("user-add");
});

router.post("/users/add", (req, res, next) => {
  const {
    username,
    password,
    name,
    description,
    profileImg,
    role
  } = req.body;

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
      res.redirect("/users");
    })
    .catch(err => { throw new Error(err)});
  })
  .catch(err => { throw new Error(err)});

});

router.get("/users/edit/:id", (req, res, next) => {
  const userId = req.params.id
  console.log(userId)
  User.findOne({ _id: userId })
    .then(user => {
      console.log(user)
      if (user._id.equals(req.user._id)) {
        res.render("user-edit", { user });
      } else {
        // no access for you!
        res.redirect(`/user/${user._id}`);
      }
      
    })
    .catch(error => {
      console.log(error);
    });
});

router.post("/users/edit", (req, res, next) => {
  const userId = req.body.userId;
  let { name, profileImg, description, username, password, role } = req.body;

  if (password) {
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    password = hashPass;


  }

  User.update(
    { _id: userId },
    { $set: { name, profileImg, description, username, password, role } },
    { new: true } 
  )
    .then(user => {
      res.redirect(`/users`);
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;