const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
var mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const TWO_HOURS = 1000 * 60 * 60 * 2;
const app = express();


const {
    PORT = 3000,
    SESS_LIFETIME = TWO_HOURS,
    SESS_NAME = 'sid',
    HOST = 'localhost',
    USER = 'root',
    PASSWORD = '',
    DB_NAME = 'Aphrodite',
    SESS_SECRET = 'haoPsURXAFxeB0ph',
    NODE_ENV = 'development'
} = process.env;

const options = {
    host: HOST,
    port: 3306,
    user: USER,
    password: PASSWORD,
    database: DB_NAME
};

const IN_PROD = NODE_ENV === 'production';

const index = require('./routes/index');
const getRoutes = require('./routes/api');

//////////////////////////////////////////////////
/// DATABASE CREATION
var con = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PASSWORD
});

var recon = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DB_NAME
});

con.connect((err) => {
    if (err) console.log(err);
    console.log('Connected!');
    con.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`, (err, result) => {
        if (err) throw err;
        console.log("Database created");
    });

    var userSql = "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, firstName VARCHAR(255) NOT NULL, lastName VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, verified TINYINT(4), token VARCHAR(255) NOT NULL)";
    var userInfoSql = "CREATE TABLE IF NOT EXISTS userInfo (id INT AUTO_INCREMENT PRIMARY KEY, age INT(11), gender VARCHAR(255) NOT NULL, sexualOrientation VARCHAR(255) NOT NULL, bio VARCHAR(255) NOT NULL, interest VARCHAR(255) NOT NULL, userId INT(11) UNSIGNED NOT NULL, username VARCHAR(255) NOT NULL UNIQUE)";
    recon.query(userSql, function (err, result) {
      if (err) throw err;
      console.log("User Table created");
    });

    recon.query(userInfoSql, function (err, result) {
        if (err) throw err;
        console.log("UserInfo Table created");
    });
});

///////////////////////////////////////////////
// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
///////////////////////////////////////////////

///////////////////////////////////////////////
//// SETTING UP A COOKIE AND PASSPORT MIDDLEWARE
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  name: SESS_NAME,
  secret: SESS_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(options),
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