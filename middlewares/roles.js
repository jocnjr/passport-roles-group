const rolesMiddleware = {
  checkBoss: () => {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === 'BOSS') {
        return next();
      } else {
        res.send(`You're not authorized!`)
      }
    }
  },
  checkDev: () => {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === 'DEV') {
        return next();
      } else {
        res.send(`You're not authorized!`)
      }
    }
  },
  checkTA: () => {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === 'TA') {
        return next();
      } else {
        res.send(`You're not authorized!`)
      }
    }
  },
  checkStudent: () => {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === 'STUDENT') {
        return next();
      } else {
        res.send(`You're not authorized!`)
      }
    }
  }
}

module.exports = { checkBoss, checkDev, checkTA, checkStudent } = rolesMiddleware;