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

// HTTP Server Configurations
let app = express();

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

// Middle Wear
app.use(bodyParser.json());

// HTTP routes
app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => res.send(doc), (err) => res.status(400).send(err));
});

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  } else {
    Todo.findById(id)
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

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }).catch(e => res.status(400).send(e));
});

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) return res.status(404).send();

  Todo.findByIdAndRemove(id).then((todo) => {
    if (todo === null) {
      res.status(404).send();
    } else {
      res.send({todo});
    }
  }).catch(e => res.status(400).send())
})

app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) return res.status(404).send();

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

   Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
   .then(todo => {
    if (todo === null) return res.status(404).send();

    res.send({todo});
   })
   .catch(e => {
     res.status(400).send();
   })
})

module.exports = {app}; // for testing purposes