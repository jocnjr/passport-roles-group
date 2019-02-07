const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const User = require('../models/user');
const Course = require("../models/course");

router.get("/", (req, res, next) => {
  res.render("home");
});

// protecting pages below
router.use(ensureLogin.ensureLoggedIn());

router.get("/users", (req, res, next) => {
  if (req.user.role === 'BOSS') req.user.isBoss = true;

  const filter = {};

  if (req.user.role === 'STUDENT') filter.role = 'STUDENT';

  User.find(filter)
    .then(users => {

      users.forEach(user => {
        if (user._id.equals(req.user._id)) {
          user.owned = true;
        }
      });

      res.render("users", { users, currentUser: req.user });
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get("/user/:id", (req, res, next) => {
  let userId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) return res.status(404).send('not-found');
  User.findOne({ _id: userId })
    // .populate("author")
    .then(user => {
      // res.send(user);
      res.render("user-detail", { user });
    })
    .catch(error => {
      throw new Error(error);
    });
});


router.get("/users/delete/:id", (req, res, next) => {
  let userId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) return res.status(404).send('not-found');
  User.findOne({ _id: userId })
    // .populate("author")
    .then(user => {
      res.render("user-delete", { user });
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.post("/users/delete", (req, res, next) => {
  let userId = req.body.id;
  User.deleteOne({ _id: userId })
    .then(user => {
      res.render("user-delete", { message: `user ${user.name} deleted!` });    
    })
    .catch(error => {
      throw new Error(error);
    });
});

// courses routes

router.get("/courses", (req, res, next) => {
  if (req.user.role === 'TA') req.user.isTA = true;

  Course.find({})
    .then(courses => {
      res.render("courses", { courses, currentUser: req.user });
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get("/course/:id", (req, res, next) => {
  let courseId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(courseId)) return res.status(404).send('not-found');
  Course.findOne({ _id: courseId })
    // .populate("author")
    .then(course => {
      // res.send(user);
      res.render("course-detail", { course });
    })
    .catch(error => {
      throw new Error(error);
    });
});


router.get("/courses/delete/:id", (req, res, next) => {
  let courseId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(courseId)) return res.status(404).send('not-found');
  Course.findOne({ _id: courseId })
    // .populate("author")
    .then(course => {
      res.render("course-delete", { course });
    })
    .catch(error => {
      console.log(error);
    });
});

router.post("/courses/delete", (req, res, next) => {
  let courseId = req.body.id;
  Course.deleteOne({ _id: courseId })
    .then(course => {
      res.render("course-delete", { message: `course ${course.title} deleted!` });    
    })
    .catch(err => {
      throw new Error(err);
    });
});
module.exports = router;