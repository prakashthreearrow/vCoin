module.exports = {
 /**
  * @description "This function will validate the token by passing it as a middleware in routes"
  * @param req
  * @param res
  */
  authCheckMiddleware: async (req, res, next) => {
    const jwtToken = req.session.token;
    if (jwtToken) {
      next();
    } else {
      res.redirect('/admin/login');
    }
  },

 /**
  * @description "This function will validate the password token by passing it as a middleware in routes"
  * @param req
  * @param res
  */
  authPasswordMiddleware: async (req, res, next) => {
    const passwordToken = req.session.passwordAuthenticateKey;
    if (passwordToken !== null) {
      next();
    } else {
      res.redirect('/admin/dashboard');
    }
  }
}
