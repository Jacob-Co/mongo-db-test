// const MongoClient = require('mongodb').MongoClient;
const {MongoClient} = require('mongodb');


// const test = require('assert');

const url = 'mongodb://localhost:27017/TodoApp';

// const dbName = 'TodoApp';


MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }

  console.log('Connected to MongoDB server');
  const todoDb = client.db('TodoApp');
  const usersDb = client.db('UsersApp');

  todoDb.collection('Todos').insertOne({
    text: 'Apply for job',
    completed: 'false'
  }, (err, result) => {
    if (err) {
      return console.log('Did not connect to mongo', err);
    }

    console.log(result.ops[0]._id.getTimestamp());
    client.close();
  })
  // client.close();
});
