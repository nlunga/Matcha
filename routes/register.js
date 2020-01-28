const express = require('express');
var bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const router = express.Router();
const joi = require('joi');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const saltRounds = 10;
const emailToken = Math.ceil(Math.random() * 2147483647);

router.post('/', (req, res) => {
    // console.log(req.body); 
    const schema = joi.object().keys({
        firstName: joi.string().alphanum().min(3).max(30).required(),
        lastName : joi.string().alphanum().min(3).max(30).required(),
        username: joi.string().alphanum().min(3).max(30).required(),
        email : joi.string().trim().email().required(),
        password: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        confPass: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        signup: joi.required()
    });
    joi.validate(req.body, schema, (err, data) => {
        // console.log(data);
        
        if (err) {
            res.send("An error has occured. " + err);
            console.log(err);
        }else {
            MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
                if (err) return console.log(err);
                bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                    const dbo = db.db('Aphrodite');
                    const mydata = {firstName: req.body.firstName, lastName: req.body.lastName, username: req.body.username, email: req.body.email, password: hash, confirmed: "No", token: emailToken};
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

                        ///////////////////////////////////
                        ///// Email sent to the user
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'nlunga@student.wethinkcode.co.za',
                                pass: '9876543210khulu'
                            }
                        });
                        // var emailToken = "jhdashghohwg2gwg";
                        const conUrl = `http://localhost:3000/confirmation/${emailToken}`;
                        const mailOptions = {
                            from: 'nlunga@student.wethinkcode.co.za',
                            to: req.body.email,
                            subject: 'Please Verify your email',
                            text: `That was easy!`,
                            html: `Please click on the link bellow to confirm your email:<br>
                                   
                            <a href="${conUrl}"><button type="button" class="btn btn-outline-secondary">Confirm</button></a>
                            `
                        };
                            
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        ///////////////////////////////////
                        
                        res.render('pages/register-success', {
                            headed: "Registration",
                            data: req.body
                        });
                    });
                });

            });
        }
    });
});

module.exports = router;
