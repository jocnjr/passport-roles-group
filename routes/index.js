const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const roles = require('../middlewares/roles');
const User = require('../models/user');

router.get("/", (req, res, next) => {
  res.render("home");
});

// protecting pages below
router.use(ensureLogin.ensureLoggedIn());

router.get("/users", (req, res, next) => {
  if (req.user.role === 'BOSS') req.user.isBoss = true;

  User.find({})
    .then(users => {

      users.forEach(user => {
        if (user._id.equals(req.user._id)) {
          user.owned = true;
        }
      });

      res.render("users", { users, currentUser: req.user });
    })
    .catch(error => {
      console.log(error);
    });
});

router.get("/user/:id", (req, res, next) => {
  let userId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) return res.status(404).send('not-found');
  user.findOne({ _id: userId })
    // .populate("author")
    .then(user => {
      // res.send(user);
      res.render("user-detail", { user });
    })
    .catch(error => {
      console.log(error);
    });
});

module.exports = router;