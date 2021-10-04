const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const headerParams = request.headers

  const user = users.find(user => user.username === headerParams.username)

  if(!user) {
    return response.status(404).json({error: "Username not found"})
  }

  request.user = user

  next()
}

function checkTodoId(request, response, next) {
  const user = request.user
  const routeParams = request.params

  const todo = user.todos.find(todo => todo.id === routeParams.id)
  if(!todo) {
    return response.status(404).json({error: "TODO not found"})
  }

  request.todo = todo

  next()
}

app.post('/users', (request, response) => {
  const bodyParams = request.body

  const isUsernameTaken = users.find(user => user.username === bodyParams.username)

  if(isUsernameTaken) {
    return response.status(400).json({ error: "Username already in use" })
  }

  const user = {
    id: uuidv4(),
    name: bodyParams.name,
    username: bodyParams.username,
    todos: []
  }

  users.push(user)
  
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const bodyParams = request.body

  const newTodo = {
    id: uuidv4(),
    title: bodyParams.title,
    done: false,
    deadline: new Date(bodyParams.deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, checkTodoId, (request, response) => {
  const bodyParams = request.body
  const todo = request.todo

  todo.title = bodyParams.title
  todo.deadline = new Date(bodyParams.deadline)
  
  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodoId, (request, response) => {
  const { todo } = request

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checkTodoId, (request, response) => {
  const { todo, user } = request

  user.todos.splice(todo, 1)

  return response.status(204).json()
});

module.exports = app;