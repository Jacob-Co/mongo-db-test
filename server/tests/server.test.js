// 3rd party modules
const request = require('supertest');
const expect = require('chai').expect;
const {ObjectID} = require('mongodb');

// Local modules
const {app} = require('./../server');
const {Todo} =  require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 888
}]

beforeEach((done) => {
  Todo.deleteMany({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
})

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Testing only';

    request(app)
      .post('/todos')
      .send({text}) //auto converted to JSON by supertest
      .expect(200)
      .expect((res) => {
        expect(res.body.text).to.equal(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).to.equal(3);
          expect(todos[2].text).to.equal(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a new todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => { // end runs the request of supertest
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).to.equal(2);
          done()
        }).catch((e) => done(e));
      });
  });
})

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).to.equal(2);
      })
      .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.equal(todos[0].text); 
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/todos/1234`)
      .expect(404)
      .end(done);
  });

})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .expect(200)
    .expect(res => {
      expect(res.body.todo._id).is.equal(hexId)
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      Todo.findById(hexId).then(todo => {
        expect(todo).to.not.exist;
        done();
      }).catch(done);
    });
  });

  it('should return 404 if todo not found', (done) => {
    let hexId = new ObjectID().toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    let hexId = '1234';

    request(app)
    .delete(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });
})

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    let hexId = todos[0]._id.toHexString();
    let updatedTodo = {
      text: 'Patch testing',
      completed: true
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .send(updatedTodo)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.equal(updatedTodo.text);
        expect(res.body.todo.completed).to.equal(true);
        expect(res.body.todo.completedAt).to.be.a('number');
      })
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    let hexId = todos[1]._id.toHexString();
    let updatedTodo = {
      text: "Updated second item",
      completed: false
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .send(updatedTodo)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.equal(updatedTodo.text);
        expect(res.body.todo.completedAt).to.not.exist;
      })
      .end(done);
  });
})