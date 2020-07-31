const mongoose = require('mongoose');

// mongoose.Promise = global.Promise;
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/UserApp', {useNewUrlParser: true});

module.exports = {mongoose};