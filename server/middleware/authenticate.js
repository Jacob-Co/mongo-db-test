const {User} = require('./../models/user')

let authenticate = (req, res, next) => {
  // middle wear function
  // process a req before the route express does

  //private route
  let token = req.header('x-auth');

  // find a user that has the same value as the given 'x-auth' header
  User.findByToken(token).then((user) => {
    if(!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next(); // needed to call the given route
  }).catch((e) => {
    res.status(401).send(); // don't pass in next as we don't want to run the route after an error
  });
};

module.exports = {
  authenticate
};