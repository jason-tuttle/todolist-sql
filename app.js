const express = require('express');
const path = require('path');
const models = require('./models');
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
  models.Todo.findAll().then(function(items) {
    res.render('index', { todos: items });
  })

});

// handle add form POST method
app.post('/add', function(req, res) {
  req.checkBody('item', 'Add some text first!').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    console.log(errors);
    models.Todo.findAll().then(function(items) {
      res.render('index', { errorMessage: errors[0].msg, todos: items });
    });
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
  const now = Date.now();
  models.Todo.findById(req.body.check)
    .then(function(item) {
      item.update({ completedAt: now }) })
    .then(function() {
      res.redirect('/');
    });
});

// handle the delete form POST method
app.post('/clear', function(req, res) {
  models.Todo.destroy({
    where: {
      completedAt: {
        $ne: null
      }
    }
  }).then(function() {
    res.redirect('/');
  });
});

app.listen(3030, function() { console.log("Runnin' on empty..."); });
