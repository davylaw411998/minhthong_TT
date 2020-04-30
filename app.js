var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')

var routes = require('./routes/index');
var users = require('./routes/users');
var owner_pitches = require('./routes/owner/pitches')
var customer_pitches = require('./routes/customer/pitches')
var app = express();

var mongoose = require('mongoose');
mongoose.connect( 
    'mongodb+srv://davylaw123:luisnani123@cluster0-eroju.mongodb.net/New_QLSB?retryWrites=true&w=majority',
     {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true})

var cors = require('cors');
app.use(cors({
    origin: 'http://localhost:4000'
}))


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'mySecretKey',
    resave: true,
    saveUninitialized: false
  }));

app.use('/', routes);
app.use('/user', users);
app.use('/pitch', customer_pitches);
app.use('/manager/pitch',owner_pitches)

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

const server = app.listen(3026, () => {
    const host = server.address().address;
    const { port } = server.address();
    console.log(`This program is running at http ${host} ${port}`);
  });
  

module.exports = app;
