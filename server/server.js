// 3rd party nodes
const express = require('express');
const bodyParser = require('body-parser');
// do I need a body parser?

//Local Imports
const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {Todo} = require('./models/todo')

let app = express();

app.listen(3000, () => {
  console.log('Started on port 3000');
})

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => res.send(doc), (err) => res.status(400).send(err));
})

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }).catch(e => res.status(400).send(e));
})

module.exports = {app}; // for testing purposes