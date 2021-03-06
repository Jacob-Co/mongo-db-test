const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject(); // mongoose converts your model into a js object

  return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = 'auth';

  // create a hash and salted string
  let token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  // fill in tokens array with an object access:'auth' & token: token string
  user.tokens = user.tokens.concat([{access, token}]);

  // return hash and salted token string
  return user.save().then(() => {
    return token;
  });
}

UserSchema.statics.findByCredentials = function(email, password) {
  let User = this;

  return User.findOne({email})
    .then((user) => {
      if(!user) {
        return Promise.reject();
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result) {
            reject();
          };
          resolve(user);
        });
      });
    });
;}

UserSchema.statics.findByToken = function(token) {
  let User = this; // this returns the model while instance method this returns a single doc
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch(e) {
    return Promise.reject();
  }

  // review findOne parameters
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
}

UserSchema.pre('save', function(next) {
  let user = this; // point to a document

  // user.isModified('password') // returns true if the password was modified
  // important so if the doc is mod but the password is not, we do not hash the pass again
   
  if(user.isModified('password')) {
    let userPassword = user.password;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(userPassword, salt, (err, hash) => {
        user.password = hash;
        next();
      })
    })
  } else {
    next();
  }
})

UserSchema.methods.removeToken = function(token) {
  let user = this;
  return user.updateOne({
    $pull: {
      tokens: {
        token
      }
    },
  });
}

let User = mongoose.model('User', UserSchema);



module.exports = {
  User
}