const express = require('express');
const router = express.Router();
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const url = "mongodb://localhost:27017/";


router.post('/', (req, res) => {
    const session = req.session;
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db('Aphrodite');
        dbo.collection('users').find({}).toArray(function(err, result) {
            // console.log(result);
            if (err) return console.log(err);
            result.forEach((item, index, array) => {
                if (item.username === req.body.username && req.body.password) {
                    const user_id = item._id;
                    // res.render(`pages/profile`, {
                        //     headed: req.body.username,
                        //     username: req.body.username,
                        //     data: req.body
                        // });
                        const hash = item.password;
                        
                    bcrypt.compare(req.body.password, hash, (err, response) => {
                        if (item.confirmed === "No") {
                            console.log("Please confirm your email");
                            res.redirect("/login");
                        }else if (item.confirmed === "Yes") {
                            session.firstName = item.firstName;
                            session.lastName = item.lastName;
                            session.username = item.username;
                            session.email = item.email;
                            /////////////////////////////////////////////
                            /// TEST RUN IF IT FAILS DELETE SCRIPT
                            MongoClient.connect(url, { useUnifiedTopology: true },(err, db) => {
                                const dbo = db.db('Aphrodite');
                                dbo.createCollection('userInfo', (err, db) => {
                                    if (err) throw err;
                                    console.log('userInfo Collection created');
                                });
                            });
                            /////////////////////////////////////////////
                            const test = session.username;
                            console.log(session);
                            if (response === true) {
                                req.login(user_id, (err) => {
                                    // res.redirect('/');
                                    res.render('pages/index', {
                                        user: test,
                                        headed : "Home"
                                    });
                                    // setTimeout( () => {
                                    // }, 500);
                                });
                                console.log('loggen in');
                            }else {
                                return console.log('password does not match');
                            }
                        }
                    });
                }else if (item.username !== req.body.username && req.body.password) {
                    return console.log("username does not exist");
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