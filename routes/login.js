const express = require('express');
const router = express.Router();
const joi = require('joi');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

router.post('/', (req, res) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        const dbo = db.db('Aphrodite');
        dbo.collection('users').find({}, { projection: { _id: 0, username: 1, password: 1 } }).toArray(function(err, result) {
            console.log(result);
            if (err) return console.log(err);
            for (i = 0; i < result.length; i++) {
                console.log(i + result[i].username + " " + result[i].password + "\n");
                if (result[i].username === req.body.username && result[i].password === req.body.password) {
                    console.log('\nThis is the username: ' + result[i].username + ' with its password: ' + result[i].password);
                    
                    res.render(`pages/profile`, {
                        headed: req.body.username,
                        username: req.body.username,
                        data: req.body
                    });
                    return console.log('user found');
                }else if (result[i].username !== req.body.username || result[i].password !== req.body.password) {
                    // console.log('\nThis is the password: ' + req.body.password + ' with its username: ' + req.body.username);
                    if (result[i].username === req.body.username && result[i].password !== req.body.password) {
                        return console.log(`Password (${req.body.password}) does not match username (${req.body.username})`);
                    }
                    return console.log('user not found');
                }
            }

        });
    });
});

module.exports = router;
// express.get(`/profile/${req.body.username}`, (req, res) =>{
//     console.log(req.url);
//     res.render('pages/profile', {
//         username: `animedude`,
//         headed: 'animedude'
//     });
// });