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
    var userInfoSql = "CREATE TABLE IF NOT EXISTS userInfo (id INT AUTO_INCREMENT PRIMARY KEY, age INT(11), gender VARCHAR(255) NOT NULL, sexualOrientation VARCHAR(255) NOT NULL, bio VARCHAR(255) NOT NULL, interest VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL UNIQUE)";
    var imagesSql = "CREATE TABLE IF NOT EXISTS images (id INT AUTO_INCREMENT PRIMARY KEY, imagePath VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL)";
    var likesSql = "CREATE TABLE IF NOT EXISTS likes (id INT AUTO_INCREMENT PRIMARY KEY, likeFrom VARCHAR(255) NOT NULL, likeTo VARCHAR(255) NOT NULL, likeEachOther TINYINT(4))";
    var viewsSql = "CREATE TABLE IF NOT EXISTS views (id INT AUTO_INCREMENT PRIMARY KEY, viewer VARCHAR(255) NOT NULL, viewed VARCHAR(255) NOT NULL)";
    var notificationsSql = "CREATE TABLE IF NOT EXISTS notifications (id INT AUTO_INCREMENT PRIMARY KEY, notifyUser VARCHAR(255) NOT NULL, messages VARCHAR(255) NOT NULL)";
    var filterSql = "CREATE TABLE IF NOT EXISTS searchFilter (id INT AUTO_INCREMENT PRIMARY KEY, ageRange VARCHAR(255) NOT NULL, fameRange VARCHAR(255) NOT NULL, distanceRange VARCHAR(255) NOT NULL, ageSort VARCHAR(255) NOT NULL, ageSort VARCHAR(255) NOT NULL, ageSort VARCHAR(255) NOT NULL)";
    recon.query(userSql, function (err, result) {
      if (err) throw err;
      console.log("User Table created");
    });

    recon.query(userInfoSql, function (err, result) {
        if (err) throw err;
        console.log("UserInfo Table created");
    });

    recon.query(imagesSql, function (err, result) {
        if (err) throw err;
        console.log("Images Table created");
    });

    recon.query(likesSql, function (err, result) {
        if (err) throw err;
        console.log("likes Table created");
    });

    recon.query(viewsSql, function (err, result) {
        if (err) throw err;
        console.log("views Table created");
    });

    recon.query(notificationsSql, function (err, result) {
        if (err) throw err;
        console.log("notifications Table created");
    });
});

const index = require('./routes/index');
const getRoutes = require('./routes/api');


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