// Environements
require('./config/config');

// 3rd party nodes
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
// do I need a body parser?

//Local Imports
const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {Todo} = require('./models/todo');
const {authenticate} = require('./middleware/authenticate');
const user = require('./models/user');
// const todo = require('./models/todo');

// HTTP Server Configurations
let app = express();

let port = process.env.PORT;

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

// Middle Wear for all routes
app.use(bodyParser.json());

// HTTP routes
app.post('/todos', authenticate, (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => res.send(doc), (err) => res.status(400).send(err));
});

app.post('/users', async (req, res) => {
  try {
    const user = new User(_.pick(req.body, ['email', 'password']));
    await user.save();
    let token = await user.generateAuthToken();
    res.header('x-auth', token).send(user); //x- indicates custom header
  } catch(e) {
    res.status(400).send(e);
  };
})

app.get('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  } else {
    Todo.findOne({
      _id: id,
      _creator: req.user._id
    })
      .then(todo => {
        if (todo === null) {
          res.status(404).send();
        } else {
          res.send({todo})
        }
      })
      .catch(e => res.status(400).send())
  }
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  })
    .then((todos) => {
      res.send({todos});
    })
    .catch(e => res.status(400).send(e));
});

app.get('/users/me', authenticate,(req, res) => {
  res.send(req.user);
});

app.delete('/todos/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) return res.status(404).send();

    let removedTodo = await Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
      });

    if (removedTodo === null) {
      res.status(404).send();
    } else {
      res.send({todo: removedTodo});
    };

  } catch(e) {
    res.status(400).send();
  };
});

app.patch('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) return res.status(404).send();

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

   Todo.findOneAndUpdate({
     _id: id,
     _creator: req.user._id
   }, {$set: body}, {new: true})
   .then(todo => {
    if (todo === null) return res.status(404).send();

    res.send({todo});
   })
   .catch(e => {
     res.status(400).send();
   })
})

app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    let user = await User.findByCredentials(body.email, body.password);
    let token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch(e) {
    res.status(400).send();
  };
});

app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch(e) {
    res.status(400).send();
  }
});

module.exports = {app}; // for testing purposes

