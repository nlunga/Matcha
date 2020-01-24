const express = require('express');
const router = express.Router();
const joi = require('joi');
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const url = "mongodb://localhost:27017/";
const LocalStrategy = require('passport-local').Strategy;

// router.post('/', passport.authenticate(
//     'local', {
//         successRedirect: '/profile',
//         failureRedirect: '/login'
//     }
// ));

// passport.use(new LocalStrategy(
//     function(username, password, done) {
    //   User.findOne({ username: username }, function (err, user) {
    //     if (err) { return done(err); }
    //     if (!user) {
    //       return done(null, false, { message: 'Incorrect username.' });
    //     }
    //     if (!user.validPassword(password)) {
    //       return done(null, false, { message: 'Incorrect password.' });
    //     }
//     MongoClient.connect(url, (err, db) => {
//         if (err) throw err;
//         const dbo = db.db('Aphrodite');
//         dbo.collection('users').find({}/*, { projection: { _id: 0, username: 1, password: 1 } }*/).toArray(function(err, result) {
//             console.log(result);
//             if (err) return console.log(err);
//             result.forEach((item, index, array) => {
//                 if (item.username === username && item.password === password) {
//                     console.log('\nThis is the username: ' + item.username + ' with its password: ' + item.password + '\n_id: ' + item._id);
//                     const user_id = item._id;
//                     req.login(user_id, (err) => {
//                         res.redirect('/');
//                     });
//                     res.render(`pages/profile`, {
//                         headed: username,
//                         username: username,
//                         data: req.body
//                     });
//                     return console.log('user found');
//                 }else if (item.username !== username || item.password !== password) {
//                     // console.log('\nThis is the password: ' + password + ' with its username: ' + username);
//                     if (item.username === username && item.password !== password) {
//                         return console.log(`Password (${password}) does not match username (${username})`);
//                     }
//                     return console.log('user not found');
//                 }
//             });
//         });
//     });
//         console.log(username);
//         console.log(password);
//         return done(null, "false");
//     //   });
//     }
// ));
//////////////////////////////
router.post('/', (req, res) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        const dbo = db.db('Aphrodite');
    dbo.collection('users').find({}/*, { projection: { _id: 0, username: 1, password: 1 } }*/).toArray(function(err, result) {
            console.log(result);
            if (err) return console.log(err);
            result.forEach((item, index, array) => {
                if (item.username === req.body.username /*&& item.password === req.body.password*/) {
                    // console.log('\nThis is the username: ' + item.username + ' with its password: ' + item.password + '\n_id: ' + item._id);
                    // const user_id = item._id;
                    // req.login(user_id, (err) => {
                    //     res.redirect('/');
                    // });
                    // res.render(`pages/profile`, {
                    //     headed: req.body.username,
                    //     username: req.body.username,
                    //     data: req.body
                    // });
                    const hash = item.password;
                    console.log(hash);
                    // bcrypt.compare(req.body.password, hash, () => {

                    // });
                    // return console.log('user found');
                /*}else if (item.username !== req.body.username || item.password !== req.body.password) {
                    // console.log('\nThis is the password: ' + req.body.password + ' with its username: ' + req.body.username);
                    if (item.username === req.body.username && item.password !== req.body.password) {
                        return console.log(`Password (${req.body.password}) does not match username (${req.body.username})`);
                    }
                    return console.log('user not found');
                }*/
            }//); 
        });
    });
});

/////////////////////////////

passport.serializeUser((user_id, done) => {
    done(null, user_id);
});
  
passport.deserializeUser((user_id, done) => {
    done(null, user_id);
});



// function authenticationMiddleware () {
//     return (req, res, next) => {
//         console.log(`
//             req.session.passport.user: ${JSON.stringify(req.session.passport)}
//         `);
//         if (req.isAuthenticated()) return next();

//         res.redirect('/login')
//     }
// }
module.exports = router;