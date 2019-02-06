const rolesMiddleware = {
  checkBoss: () => {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === 'BOSS') {
        return next();
      } else {
        res.send(`You're not authorized!`)
      }
    }
  }
}

module.exports = { checkBoss } = rolesMiddleware;