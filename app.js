const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const joi = require('joi');
const session = require('express-session');
// const mongo = require('mongodb');
const app = express();
const port = 3000;

//////////////////////////////////////////////////
/// DATABASE CREATITION
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/Aphrodite";

MongoClient.connect(url, (err, db) => {
    if (err) throw err;
    console.log("Database created!");
    db.close();
});

////////////////////////////////////////////////
/// CREATING A COLLECTION
MongoClient.connect('mongodb://localhost:27017/', (err, db) => {
    if (err) throw err;
    const dbo = db.db('Aphrodite');
    dbo.createCollection('users', (err, res) => {
        if (err) throw err;
        console.log('users Collection Created');
        db.close();
    });
});
////////////////////////////////////////////////

///////////////////////////////////////////////
// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
///////////////////////////////////////////////

///////////////////////////////////////////////
//// SETTING UP A COOKIE
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
//////////////////////////////////////////////

///////////////////////////////////////////////
// The code bellow is how you write a custome middleware
/*
const logger = (req, res, next) =>{
    console.log("Logging...");
    next();
}
///////////////////////////////////////////////

app.use(logger);
*/

//////////////////////////////////////////////
// body-parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//////////////////////////////////////////////

//////////////////////////////////////////////
//express middleware - set Sastic path
app.use(express.static(path.join(__dirname, 'public')));
//////////////////////////////////////////////

///////////////////////////////////////////////////////
///// IMPORT ROUTES
const getRoutes = require('./routes/api');
app.use('/api', getRoutes);

app.get('/', (req, res) => {
    // console.log(req.body);
    res.render('pages/index',{
        title:'Customers',
        headed: 'Home'
    });
});

app.get('/index', (req, res) => {
    // console.log(req.body);
    res.render('pages/index',{
        title:'Customers',
        headed: 'Home'
    });
});

app.get('/signup', (req, res) => {
    // console.log(req.body);
    res.render('pages/signup',{
        title:'Register an account',
        headed: 'Sign Up'
    });
});

app.get('/login', (req, res) => {
    // console.log(req.body);
    res.render('pages/login',{
        title:'login',
        headed: 'Login'
    });
});

app.get('/forgot_password', (req, res) => {
    res.render('pages/forgot_password', {
        title : 'Forgot Password',
        headed: 'Forgot Password'
    })
});

app.get('/profile', (req, res) => {
    console.log(req.url);
    res.render('pages/profile');
});

app.get('/user-profile', (req, res) => {
    console.log(req.url);
    res.render('pages/user-profile');
});

const registerRoutes = require('./routes/register');
app.use('/signup', registerRoutes);

const loginRoute = require('./routes/login');
app.use('/login', loginRoute)

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
 