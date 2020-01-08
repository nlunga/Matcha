const express = require('express');
const router = express.Router();
const joi = require('joi');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

router.post('/', (req, res) => {
    const schema = joi.object().keys({
        username: joi.string().alphanum().min(3).max(30).required(),
        email : joi.string().trim().email().required(),
        password: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        confPass: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        next: joi.required()
    });
    joi.validate(req.body, schema, (err, data) => {
        if (err) {
            res.send("An error has occured. " + err);
            console.log(err);
        }else {
            MongoClient.connect(url, (err, db) => {
                if (err) throw err;
                const dbo = db.db('Aphrodite');
                const mydata = {username: req.body.username, email: req.body.email, password: req.body.password};
                dbo.collection('users').insertOne(mydata, (err, res) => {
                    if (err) throw err;
                    console.log('1 document inserted');
                    db.close();
                });
            });
            res.render('pages/register-success', {
                headed: "Registration",
                data: req.body
            });
            console.log(data);
        }
    });
});

module.exports = router;