const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const uuidv1 = require('uuid/v1');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const emailToken = uuidv1();

router.post('/', (req, res) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db('Aphrodite');
        dbo.collection('users').find({}).toArray(function(err, result) {
            // console.log(result);
            if (err) return console.log(err);
            result.forEach((item, index, array) => {
                if (item.email === req.body.email) {
                    
                    dbo.collection('users').updateOne(
                        { "token": item.token }, 
                        { $set: {"token": emailToken} },
                        { upsert: true }
                    );
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
                        const conUrl = `http://localhost:3000/forgot/${emailToken}`;
                        const mailOptions = {
                            from: 'nlunga@student.wethinkcode.co.za',
                            to: req.body.email,
                            subject: 'Reset Password',
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
                    // res.redirect('/reset-password');
                }else if (item.email !== req.body.email) {
                    return console.log("email does not exist");
                }
            }); 
        });
    });
});

module.exports = router;