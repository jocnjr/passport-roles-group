const express = require('express');
const router  = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");
const roles = require('../middlewares/roles');
const Course = require("../models/course");


router.get("/login", (req, res, next) => {
  res.render("auth/login", {'errorMessage': req.flash('error')});
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
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
      throw new Error(error);
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

  if (!role) role = 'STUDENT';

  User.update(
    { _id: userId },
    { $set: { name, profileImg, description, username, password, role } },
    { new: true } 
  )
    .then(user => {
      res.redirect(`/users`);
    })
    .catch(error => {
      throw new Error(error);
    });
});


// courses routes


router.get("/courses/add", roles.checkTA, (req, res, next) => {
  User.find({role: 'STUDENT'})
  .then(users => {
    let course = new Course();
    course._id = null;
    res.render("course-form", { course, allStudents: users, currentUser: req.user });
  })
  .catch(err => { throw new Error(err) });
});

router.post("/courses/add", (req, res, next) => {
  const {
    title,
    leadTeacher,
    startDate,
    endDate,
    TAs,
    courseImg,
    description,
    students,
    status
  } = req.body;

  if (title == '') {
    res.render('course-add', {
      msgError: `title can't be empty`
    })
    return;
  }

  Course.findOne({ "title": title })
  .then(course => {
    if (course !== null) {
      res.render("course-form", {
        msgError: "The course with that title already exists!"
      });
      return;
    }

    const newCourse = new Course({
      title,
      leadTeacher,
      startDate,
      endDate,
      TAs,
      courseImg,
      description,
      students,
      status
    });

    newCourse.save()
    .then(course => {
      res.redirect("/courses");
    })
    .catch(err => { throw new Error(err)});
  })
  .catch(err => { throw new Error(err)});

});

router.get("/courses/edit/:id", checkTA, (req, res, next) => {
  const courseId = req.params.id

  Course.findOne({ _id: courseId })
    .populate('students')
    .then(course => {
      User.find({role: 'STUDENT'})
      .then(users => {
        res.render("course-form", { course, allStudents: users, currentUser: req.user });
      })
      .catch(err => { throw new Error(err) });
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.post("/courses/edit", (req, res, next) => {
  const courseId = req.body.courseId;
  const {
    title,
    leadTeacher,
    startDate,
    endDate,
    TAs,
    courseImg,
    description,
    status,
    students
  } = req.body;

  Course.update(
    { _id: courseId },
    { $set: {
      title,
      leadTeacher,
      startDate,
      endDate,
      TAs,
      courseImg,
      description,
      status,
      students
     }
    },
    { new: true } 
  )
    .then(course => {
      res.redirect(`/courses`);
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',passport.authenticate('facebook', {
  successRedirect: '/courses',
  failureRedirect: '/login' })
);

router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;