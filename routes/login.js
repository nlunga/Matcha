const express = require('express');
const router = express.Router();
const joi = require('joi');
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

router.post('/', (req, res) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        const dbo = db.db('Aphrodite');
    dbo.collection('users').find({}/*, { projection: { _id: 0, username: 1, password: 1 } }*/).toArray(function(err, result) {
            console.log(result);
            if (err) return console.log(err);
            result.forEach((item, index, array) => {
                if (item.username === req.body.username && item.password === req.body.password) {
                    console.log('\nThis is the username: ' + item.username + ' with its password: ' + item.password + '\n_id: ' + item._id);
                    const user_id = item._id;
                    req.login(user_id, (err) => {
                        res.redirect('/');
                    });
                    res.render(`pages/profile`, {
                        headed: req.body.username,
                        username: req.body.username,
                        data: req.body
                    });
                    return console.log('user found');
                }else if (item.username !== req.body.username || item.password !== req.body.password) {
                    // console.log('\nThis is the password: ' + req.body.password + ' with its username: ' + req.body.username);
                    if (item.username === req.body.username && item.password !== req.body.password) {
                        return console.log(`Password (${req.body.password}) does not match username (${req.body.username})`);
                    }
                    return console.log('user not found');
                }
            });
        });
    });
});

passport.serializeUser((user_id, done) => {
    done(null, user_id);
  });
  
  passport.deserializeUser((user_id, done) => {
      done(null, user_id);
  });
module.exports = router;