const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const joi = require('joi');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const TWO_HOURS = 1000 * 60 * 60 * 2;
// const mongo = require('mongodb');
const app = express();

const options = {
    url: "mongodb://localhost:27017/Aphrodite",
    ttl: 2 * 24 * 60 * 60
};
const {
    PORT = 3000,
    SESS_LIFETIME = TWO_HOURS,
    SESS_NAME = 'sid',
    SESS_SECRET = 'haoPsURXAFxeB0ph',
    NODE_ENV = 'development'
} = process.env;

const IN_PROD = NODE_ENV === 'production';

const index = require('./routes/index');
const getRoutes = require('./routes/api');

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

MongoClient.connect('mongodb://localhost:27017/', {useUnifiedTopology: true}, (err, db) => {
    if (err) throw err;
    const dbo = db.db('Aphrodite');
    dbo.createCollection('userInfo', (err, res) => {
        if (err) throw err;
        console.log('userInfo Collection Created');
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
  name: SESS_NAME,
  secret: SESS_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore(options),
  cookie: {
      maxAge : SESS_LIFETIME,
      sameSite: true,
      secure: IN_PROD
    }
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
app.use(express.static(path.join(__dirname, '/node_modules/bootstrap/dist')));
//////////////////////////////////////////////

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.use((req, res, next) => {
    const {userId} = req.session;
    if (userId) {
        const link ="mongodb://localhost:27017/";
        res.locals.user =  MongoClient.connect(link, { useUnifiedTopology: true }, (err, db) => {
            if (err) throw err;
            const dbo = db.db('Aphrodite');
            dbo.collection('users').find({}).toArray(function(err, result) {
                if (err) return console.log(err);
                result.forEach((item, index, array) => {
                    if (item._id === userId) {
                        user = item._id; // TODO change data;
                    }
                });
                db.close();
            });
        });
    }
    next();
});

///////////////////////////////////////////////////////
///// IMPORT ROUTES
app.use('/api', getRoutes);
app.use('/', index);
///////////////////////////////////////////////////////



//// Authentification and page restriction middleware
// function authenticationMiddleware () {
//     return (req, res, next) => {
//         console.log(`
//             req.session.passport.user: ${JSON.stringify(req.session.passport)}
//         `);
//         if (req.isAuthenticated()) return next();

//         res.redirect('/login')
//     }
// }
//////////////////////////////////////////

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));