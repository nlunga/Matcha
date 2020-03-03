const express = require('express');
const router = express.Router();
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
// const session = require('express-session');
const bcrypt = require('bcrypt');
const url = "mongodb://localhost:27017/";

router.post('/', (req, res)=>{
    const user = req.body.username;
    const pass = req.body.password;
    const session = req.session;

    MongoClient.connect(url, {useUnifiedTopology: true}, (err, db) => {
        if (err) throw err;
        const dbo = db.db('Aphrodite');
        dbo.collection('users').find({}).toArray((err, result) => {
            if (err) throw err;
            result.forEach((item, index) => {
                if (item.username === user && pass) {
                    const hash = item.password;
                    bcrypt.compare(pass, hash, (err, response) => {
                        if (response === true) {
                            res.render('pages/index', {
                                headed: "Home",
                                user: user
                            });
                        }
                    });
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