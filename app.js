const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const joi = require('joi');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
// const mongo = require('mongodb');
const app = express();
const port = 3000;
const options = {
    url: "mongodb://localhost:27017/Aphrodite",
    ttl: 2 * 24 * 60 * 60
};

//////////////////////////////////////////////////
/// DATABASE CREATITION
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/Aphrodite";

MongoClient.connect(url, {useUnifiedTopology: true} , (err, db) => {
    if (err) throw err;
    console.log("Database created!");
    db.close();
});

////////////////////////////////////////////////
/// CREATING A COLLECTION
MongoClient.connect('mongodb://localhost:27017/', {useUnifiedTopology: true}, (err, db) => {
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
// Session store on Mongodb
// app.use(session({
//     secret: 'JL8WMKwPJNHSQotp',
//     store: new MongoStore(options),
//     // proxy: true,
//     resave: false,
//     saveUninitialized: false
// }));
///////////////////////////////////////////////

///////////////////////////////////////////////
//// SETTING UP A COOKIE AND PASSPORT MIDDLEWARE
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'haoPsURXAFxeB0ph',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore(options)
//   cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());
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
    console.log(req.user);
    console.log(req.isAuthenticated());
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

app.get('/profile', authenticationMiddleware(), (req, res) => {
    console.log(req.url);
    res.render('pages/profile', {
        headed: "profile"
    });
});

const registerRoutes = require('./routes/register');
app.use('/signup', registerRoutes);

const loginRoute = require('./routes/login');
app.use('/login', loginRoute)

// passport.use(new LocalStrategy(
//     function(username, password, done) {
//       User.findOne({ username: username }, function (err, user) {
//         if (err) { return done(err); }
//         if (!user) {
//           return done(null, false, { message: 'Incorrect username.' });
//         }
//         if (!user.validPassword(password)) {
//           return done(null, false, { message: 'Incorrect password.' });
//         }
//         console.log(username);
//         console.log(password);
//         return done(null, user);
//       });
//     }
// ));

/////////////////////////////////////////
//// Authentification and page restriction middleware
function authenticationMiddleware () {
    return (req, res, next) => {
        console.log(`
            req.session.passport.user: ${JSON.stringify(req.session.passport)}
        `);
        if (req.isAuthenticated()) return next();

        res.redirect('/login')
    }
}
//////////////////////////////////////////

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
 