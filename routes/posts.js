const express = require('express');
const router = express.Router();
const joi = require('joi');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

router.post('/', (req, res) => {
    // console.log(req.body);
    const schema = joi.object().keys({
        firstName: joi.string().alphanum().min(3).max(30).required(),
        lastName : joi.string().alphanum().min(3).max(30).required(),
        username: joi.string().alphanum().min(3).max(30).required(),
        email : joi.string().trim().email().required(),
        password: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        confPass: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        next: joi.required()
    });
    joi.validate(req.body, schema, (err, data) => {
        // console.log(data);
        if (err) {
            res.send("An error has occured. " + err);
            console.log(err);
        }else {
            MongoClient.connect(url, (err, db) => {
                if (err) return console.log(err);
                const dbo = db.db('Aphrodite');
                const mydata = {firstName: req.body.firstName, lastName: req.body.lastName, username: req.body.username, email: req.body.email, password: req.body.password};
                dbo.collection('users').find({}, { projection: { _id: 0, username: 1, email: 1 } }).toArray(function(err, result) {
                    // const dataLenght = result.length;
                    if (err) return console.log(err);
                    for (i = 0; i < result.length; i++) {
                        if (result[i].username === req.body.username) {
                            return console.log('username already exists');
                        }else if (result[i].email === req.body.email) {
                            return console.log('email already exists');
    
                        }
                    }
                    dbo.collection('users').insertOne(mydata, (err, res) => {
                        if (err) return console.log(err);
                        console.log('1 document inserted');
                        db.close();
                    });

                    res.render('pages/register-success', {
                        headed: "Registration",
                        data: req.body
                    });
                });
                /*dbo.collection('users').findOne({ }, (err, result) => {
                    console.log(result);
                    // console.log('this is result ' + result[2].username);
                    if (err) return console.log(err);
                    if (result.username === req.body.username) {
                        console.log('username already exists');
                    }else if (result.email === req.body.email) {
                        console.log('email already exists');

                    }else{
                        dbo.collection('users').insertOne(mydata, (err, res) => {
                            if (err) return console.log(err);
                            console.log('1 document inserted');
                            db.close();
                        });

                        res.render('pages/register-success', {
                            headed: "Registration",
                            data: req.body
                        });
                    }
                });*/
            });
            // console.log(data);
        }
    });
});

module.exports = router;
