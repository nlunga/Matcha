const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
var mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const TWO_HOURS = 1000 * 60 * 60 * 2;
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const formatMessage = require('./utils/messages');


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
    var filterSql = "CREATE TABLE IF NOT EXISTS searchFilter (id INT AUTO_INCREMENT PRIMARY KEY, ageRange VARCHAR(255) NOT NULL, fameRange VARCHAR(255) NOT NULL, distanceRange VARCHAR(255) NOT NULL, ageSort VARCHAR(255) NOT NULL, distanceSort VARCHAR(255) NOT NULL, fameSort VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL)";
    var messageSql = "CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, sender VARCHAR(255) NOT NULL, message VARCHAR(255) NOT NULL, destination VARCHAR(255) NOT NULL, timeStamp VARCHAR(255) NOT NULL)";
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

    recon.query(messageSql, function (err, result) {
        if (err) throw err;
        console.log("Messages Table created");
    });

    recon.query(filterSql, function (err, result) {
        if (err) throw err;
        console.log("searchFilter Table created");
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
//// SETTING UP A COOKIE 
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

///////////////////////////////////////////////////////
///// IMPORT ROUTES
app.use('/api', getRoutes);
app.use('/', index);
///////////////////////////////////////////////////////

io.on('connect', (socket) => {
    // console.log(`Connected...`);

    const chatBot = 'nnilChat Bot';
    socket.on('joinRoom', ({username, handle, room}) => {
        socket.join(room);
        console.log(username);
        console.log(handle);
        socket.emit('messageRoom', formatMessage(chatBot,`Welcome to ${room}!`));
        socket.broadcast.to(room).emit('messageRoom', formatMessage(chatBot ,`${handle} has joined the chat`));

        socket.on('chat', (data) => {
            console.log(data);
            // io.sockets.emit('message', data);
            // socket.broadcast.in(room).emit('message', formatMessage(data.handle ,data.message)); /// This broadcasts to all but self
            recon.query(`INSERT INTO messages (sender, message, destination, timeStamp) VALUES (?, ?, ?, ?)`, [handle, data.message, room, moment().format('h:mm a')], (err, result) => {
                if (err) throw err;
                io.sockets.in(room).emit('messageRoom', formatMessage(data.handle ,data.message)); /// This broadcasts to all including self
                recon.query(`INSERT INTO notifications (notifyUser, messages) VALUES (?, ?)`, [handle, data.message], (err, result) => {
                    if (err) throw err;
                    io.sockets.in(room).emit('notify', `${data.handle} sent a message in the chatroom`); /// This broadcasts to all including self
                    console.log("1 record inserted");
                });
                console.log("1 record inserted");
            });
        });

        socket.on('disconnect', () => {
            io.sockets.in(room).emit('messageRoom', formatMessage(chatBot, `${handle} has left the chat`));
        });
    });

    

    socket.on('chat', (data) => {
        // io.sockets.emit('message', data);
        io.sockets.emit('message', formatMessage(data.handle ,data.message));
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('check', data);
    });

    // Broadcast when user connects

    //Broadcast when user disconnects
    // socket.on('disconnect', () => {
    //     io.emit('message', formatMessage(chatBot, 'A user has left the chat'));
    // });
});

http.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));