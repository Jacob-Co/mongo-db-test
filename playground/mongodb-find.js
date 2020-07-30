const {MongoClient, ObjectID} = require('mongodb');

const url = 'mongodb://localhost:27017/TodoApp';

MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  // const todoDb = client.db('TodoApp');
  const usersDb = client.db('UsersApp'); // Connect to the database name
  const todoDb = client.db('TodoApp')
  console.log('Connected to MongoDB server');

  usersDb.collection('Users')
  .findOneAndUpdate({_id: new ObjectID('5f211930825617142366d9ae')}, {
    $set: {
      name: 'Isabel Reyes'
    },
    $inc: {
      age: -1
    }
  }, {
    returnOriginal: false
  }).then(result => console.log(result))

  // usersDb.collection('Users') // Connect to the collection
  // .find({name: 'Jacob'})
  // .count()
  // .then(count => console.log(count), err => console.log(`An error occured ${err}`))

  // todoDb.collection('Todos')
  // .find()// Returns a mongo cursor, may pass in a querry object
  // .count()
  // .then(count => console.log(`Todos count: ${count}`), err => console.log('Unable to fetch todos', err));

  // todoDb.collection('Todos')
  // .find({_id: new ObjectID('5f211a580474dff37efd24bf')})// Returns a mongo cursor, may pass in a querry object
  // .toArray() //transforms a mongo cursor into an array of obj
  // .then(docs => console.log(docs), err => console.log('Unable to fetch todos', err));

  // client.close();
}); 
