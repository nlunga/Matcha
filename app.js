const express = require('express');
const app = express();
const port = 3000;
const path = require('path');


// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// use res.render to load up an ejs view file


// app.get('/', (req, res) => res.send('Hello World!'))
// index page 
app.get("/", (req, res) => {
    res.render("index");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
 