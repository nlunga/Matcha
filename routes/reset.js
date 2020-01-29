const express = require('express');
const router = express.Router();
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const url = "mongodb://localhost:27017/";
const saltRounds = 10;

router.post('/', (req, res) => {
    const token = req.body.token;
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) return console.log(err);
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            const dbo = db.db('Aphrodite');
            dbo.collection('users').find({}, { projection: { _id: 0, username: 1, token: 1 } }).toArray(function(err, result) {
                if (err) return console.log(err);
                result.forEach((item, index, array) => {
                    console.log(item);
                    if (item.token === req.body.token) {
                        // const user_id = item._id;
                            
                        dbo.collection('users').updateOne(
                            { "password" : item.password, "token": item.token }, 
                            { $set: {"password": hash, "token": ""} },
                            { upsert: true }
                        );
                        console.log("Your Password has been updated");
                        res.redirect('/login');
                    }else if (item.token !== req.body.token) {
                        console.log(item.token + " and new token: " + req.body.token);
                        return console.log("username does not exist");
                    }
                }); 
            });
        });

    });
});

module.exports = router;