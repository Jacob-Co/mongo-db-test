let env = process.env.NODE_ENV || 'development';
console.log('env *****', env);

if (env === 'development' || env === 'test') {
  // load json file (will not be part of the git repo)
  // when you require json it auto returns an js object
  let config = require('./config.json');
  let envConfig = config[env];

  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
}

// if (env === 'development') {
//   process.env.PORT=3000;
//   process.env.MONGODB_URI='mongodb://localhost:27017/TodoApp'
// } else if (env === 'test') {
//   process.env.PORT=3000;
//   process.env.MONGODB_URI='mongodb://localhost:27017/TodoAppTest'
// } 