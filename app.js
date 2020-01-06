const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/users";

MongoClient.connect(url, (err, db) => {
    if (err) throw err;
    console.log("Database created!");
    db.close();
});

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// use res.render to load up an ejs view file


// The code bellow is how you write a custome middleware
/*
const logger = (req, res, next) =>{
    console.log("Logging...");
    next();
}

app.use(logger);
*/

// body-parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//express middleware - set Sastic path
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => res.send('Hello World!'))
app.get('/', (req, res) => {
    res.render('pages/index',{
        title:'Customers',
        headed: 'Home'
    });
});

app.get('/api', (req, res) => {
    res.render('pages/test', {
        headed: 'Api'
    });
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
 