// 3rd party modules
const request = require('supertest');
const expect = require('chai').expect;

// Local modules
const {app} = require('./../server');
const {Todo} =  require('./../models/todo');

const todos = [{
  text: 'First test todo'
}, {
  text: 'Second test todo'
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
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        done();
      })
  })
})