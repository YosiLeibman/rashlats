var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
const config = require('./config/database');

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json

app.use(bodyParser.json());

//static folder
app.use(express.static(path.join(__dirname,'public')));

//express session middleware - user login\out
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//express messages middleware - option to send success\error masseges
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root    = namespace.shift()
    , formParam = root;
    
    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//passport config
require('./config/passport')(passport);
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

//import  DB schema
var Message_model = require('./models/Message_model');

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});


// router file
var users = require('./routes/users');
app.use('/users', users);
var messages = require('./routes/messages');
app.use('/messages', messages);
var donate = require('./routes/donate');
app.use('/donate', donate);


// home page route
app.get('/', function(req,res){
    res.render('index',{
      // here i can send news from db to home page directly - just need to make error validation        
    });
});

// view angine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//server starter
app.listen(3000, function(){
    console.log('server started on port 3000');
});