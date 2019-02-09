const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const session = require("express-session");
const passport = require("passport");
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const Config = require('./config.js');
const PORT = 3000;

mongoose
  .connect('mongodb://localhost/passport-roles-group', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(error => {
    throw new Error(error);
  });

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

hbs.registerHelper('if_equal', function (a, b, opts) {
  if (a == b) {
      return opts.fn(this) 
  } else { 
      return opts.inverse(this) 
  } 
});
hbs.registerHelper('if_not_equal', function (a, b, opts) {
  if (a != b) {
      return opts.fn(this) 
  } else { 
      return opts.inverse(this) 
  } 
});
hbs.registerPartials(__dirname + '/views/partials');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));



// passport local config

app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) { return done(err); }
    done(null, user);
  });
});

app.use(flash());

passport.use(new LocalStrategy({
  passReqToCallback: true
},(req, username, password, done) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: "Incorrect password" });
    }

    return done(null, user);
  });
}));

// passport facebook strategy config

passport.use(new FacebookStrategy({
  clientID: Config.facebook.clientID,
  clientSecret: Config.facebook.clientSecret,
  callbackURL: "http://localhost:3000/auth/facebook/callback"
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ facebookId: profile.id })
  .then((user, err) => {
    if (err) {
      return done(err);
    }
    if (user) {
      return done(null, user);
    }

    const newUser = new User({
      username: `facebook_${profile.id}`,
      name: profile.displayName,
      role: 'STUDENT', 
      facebookId: profile.id
    });

    newUser.save()
    .then(user => {
      done(null, newUser);
    })
  })
  .catch(error => {
    done(error)
  })
}
));

app.use(passport.initialize());
app.use(passport.session());




// default value for title local
app.locals.title = 'Ironhack Management System';

const authRoutes = require('./routes/auth');
const siteRoutes = require('./routes/index');

app.use('/', authRoutes);
app.use('/', siteRoutes);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

module.exports = app;