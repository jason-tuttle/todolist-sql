const express = require('express');
const path = require('path');
const model = require('./models');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');


const app = express();

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

// parse all requests using the generic body parser (req.body is now available)
app.use(bodyParser.urlencoded({extended: true}));
// gives us a way to validate input (e.g., ensure emails are valid)
app.use(expressValidator());
app.use('/resources', express.static(path.join(__dirname, 'public')));

// index view for the todo list
app.get('/', function(req, res) {
  res.render('index', { todos: models.Todo.findAll()});
});

// handle add form POST method
app.post('/add', function(req, res) {
  req.checkBody('item', 'Add some text first!').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    console.log(errors);
    res.render('index', { errorMessage: errors[0].msg, todos: models.Todo.findAll() });
  } else {
    models.Todo.create({item: req.body.item})
    .then(function(newItem) {
      console.log(newItem);
      res.redirect('/');
    });
  }
});

// handle complete form POST method
app.post('/complete', function(req, res) {
  models.Todo.findById(req.body.check).then(function(todo) {
    todo.update()
  })

  //eventually we'll send back to '/'
  res.redirect('/');
});

app.listen(3030, function() { console.log("Runnin' on empty..."); });
