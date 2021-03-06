// 3rd party modules
const request = require('supertest');
const expect = require('chai').expect;
const {ObjectID} = require('mongodb');

// Local modules
const {app} = require('./../server');
const {Todo} =  require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);

beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Testing only';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).to.equal(1);
      })
      .end(done)
  })
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.equal(todos[0].text); 
      })
      .end(done);
  });

  it('should not return todo doc created by another user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/todos/1234`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
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
  
  it('should not remove a todo owned by anther user', (done) => {
    let hexId = todos[1]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      Todo.findById(hexId).then(todo => {
        expect(todo).to.exist;
        done();
      }).catch(done);
    });
  });

  it('should return 404 if todo not found', (done) => {
    let hexId = new ObjectID().toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    let hexId = '1234';

    request(app)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    let hexId = todos[0]._id.toHexString();
    let updatedTodo = {
      text: 'Patch testing',
      completed: true
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(updatedTodo)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.equal(updatedTodo.text);
        expect(res.body.todo.completed).to.equal(true);
        expect(res.body.todo.completedAt).to.be.a('number');
      })
      .end(done);
  });

  it('should not update the todo of another user', (done) => {
    let hexId = todos[0]._id.toHexString();
    let updatedTodo = {
      text: 'Patch testing',
      completed: true
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send(updatedTodo)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        Todo.findById(hexId)
          .then(todo => {
            expect(todo.text).to.not.equal(updatedTodo.text);
            expect(todo.completed).to.not.equal(updatedTodo.completed);
            done()
          })
          .catch(done);
      });
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
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).to.equal(updatedTodo.text);
        expect(res.body.todo.completedAt).to.not.exist;
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).to.equal(users[0]._id.toHexString());
        expect(res.body.email).to.equal(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).to.be.empty;
        expect(res.body).to.eql({});
      })
      .end(done);
  });
})

describe('POST /users', () => {
  it('should create a user', (done) => {
    let email = 'example@example.com';
    let password = '123456';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).to.exist;
        expect(res.body._id).to.exist;
        expect(res.body.email).to.equal(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).to.exist;
          expect(user.password).to.not.equal(password);
          done();
        }).catch((e) => done(e))
      });
  });

  it('should return validation errors if email is invalid', (done) => {
    let email = 'example.com';
    let password = '12345';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should return validation errors if password is invalid', (done) => {
    let email = 'example@example.com';
    let password = '12345';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    let email = users[0].email;
    let password = '123456';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });
})

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).to.exist;
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(res.body._id).then((user) => {
          expect(user.tokens[1]).to.include({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e))
      });
  })

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + 'wrongPassword'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).to.not.exist;
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).to.equal(1);
          done();
        }).catch((e) => done(e));
      });
  })
})

describe('DELETE /users/me/token', () => {
  it('should remove auth token on log out', (done) => {
    let tokenToDelete = users[0].tokens[0].token;

    request(app)
      .delete('/users/me/token')
      .set('x-auth', tokenToDelete)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        User.findById(users[0]._id)
          .then((user) => {
            expect(user.tokens.length).to.equal(0);
            done();
          }).catch(e => done(e));
      });
  })
})