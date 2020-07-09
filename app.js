var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

var routes = require('./routes/index');
var users = require('./routes/users');
var locations = require('./routes/location');
var owner_pitches = require('./routes/owner/pitches')
var customer_pitches = require('./routes/customer/pitches')
var owner_subpitches = require('./routes/owner/subpitches')
var summary = require('./routes/summary_hourly/summaryBook_hourly_controller')
//var customer_subpitches = require('./routes/customer/subpitches')
var app = express();

var mongoose = require('mongoose');
mongoose.connect( 
    'mongodb+srv://davylaw123:luisnani123@cluster0-eroju.mongodb.net/New_QLSB?retryWrites=true&w=majority',
     {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true})

var cors = require('cors');
app.use(cors({
    origin: 'http://localhost:4200'
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
var storage = multer.diskStorage({
destination: function (req, file, cb) {
    cb(null, 'uploads')
},
filename: function (req, file, cb) {
    cb(null, `${file.originalname}`)
    }
})
var upload = multer({ storage: storage })
app.post('/file',upload.single('file'),(req,res,next)=>{
    const file= req.file
    if(!file){
        const err = new Error('Please upload image')
        return res.status(400).json(err)
    }
    res.send(file)
})
app.use('/', routes);
app.use('/', locations);
app.use('/manager', summary)
app.use('/user', users);
app.use('/pitch', customer_pitches);
//app.use('/subpitch', customer_subpitches);
app.use('/manager/pitch',owner_pitches)
app.use('/manager/subpitch',owner_subpitches)

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

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
