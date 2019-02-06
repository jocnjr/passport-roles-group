const rolesMiddleware = {
  checkBoss: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'BOSS') {
      next();
    } else {
      res.send(`You're not authorized!`);
    }
  },
  checkDev: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'DEV') {
      next();
    } else {
      res.send(`You're not authorized!`);
    }
  },
  checkTA: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'TA') {
      next();
    } else {
      res.send(`You're not authorized!`);
    }
  },
  checkStudent: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'STUDENT') {
      next();
    } else {
      res.send(`You're not authorized!`);
    }
  }
}

module.exports = { checkBoss, checkDev, checkTA, checkStudent } = rolesMiddleware;