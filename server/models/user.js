const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: VALUE => `${VALUE} is not a valid email`
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      require: true
    },
    token: {
      type: String,
      require: true
    }
  }]
});

UserSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject(); // mongoose converts your model into a js object

  return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function() { // instance method
  let user = this;
  let access = 'auth';

  // create a hash and salted string
  let token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  // fill in tokens array with an object access:'auth' & token: token string
  user.tokens = user.tokens.concat([{access, token}]);

  // return hash and salted token string
  return user.save().then(() => {
    return token;
  });
}

let User = mongoose.model('User', UserSchema);



module.exports = {
  User
}