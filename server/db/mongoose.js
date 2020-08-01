const mongoose = require('mongoose');

// mongoose.Promise = global.Promise;
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});

module.exports = {mongoose};

// production env (HEROKU) = process.env.MONGODB_URI
// development env = 'mongodb://localhost:27017/UserApp'
// test env = process.env.NODE_ENV