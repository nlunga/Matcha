const express = require('express');
const router = express.Router();
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const uuidv1 = require('uuid/v1');
const joi = require('joi');
const saltRounds = 10;
const emailToken = uuidv1();
const url = 'mongodb://localhost:27017/';

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        next();
    }
}

const redirectDashboard = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        next();
    }
}

router.get('/', (req, res) => {
    // const {userId} = req.session;
    const userId = 1;
    console.log(userId);
    console.log(req.user);
    console.log(req.isAuthenticated());
    res.render('pages/index',{
        title:'Customers',
        headed: 'Home',
        dod : userId
    });
});

router.get('/index', (req, res) => {
    // const {userId} = req.session;
    const userId = 1;
    res.render('pages/index',{
        title:'Customers',
        headed: 'Home',
        dod : userId
    });
});

router.get('/dashboard', redirectLogin, (req, res) => {
    res.render('pages/suggestion');
});

router.get('/signup', redirectDashboard, (req, res) => {
    res.render('pages/signup',{
        title:'Register an account',
        headed: 'Sign Up'
    });
});

router.post('/signup', redirectDashboard, (req, res) => {

    /* let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let confPass = req.body.confPass; */
  
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
                            // req.session.userId = _id;//TODO: get proper id
                            console.logg("This is " + _id);
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

router.get('/login', redirectDashboard, (req, res) => {
    res.render('pages/login',{
        title:'login',
        headed: 'Login'
    });
});

router.post('/login', redirectDashboard, (req, res) => {
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
                            if (response === true) {
                                req.session.userId = item._id;
                                console.log('loggen in');
                                return res.redirect('/dashboard');
                            }else {
                                res.redirect("/login");
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




router.get('/forgot_password', redirectDashboard, (req, res) => {
    res.render('pages/forgot_password', {
        title : 'Forgot Password',
        headed: 'Forgot Password'
    })
});

router.get('/profile', redirectLogin, (req, res) => {
    console.log(req.url);
    res.render('pages/profile', {
        headed: "profile"
    });
});

router.get('/reset-password', redirectDashboard, (req, res) => {
    res.render('pages/reset-password', {
        headed: 'Reset Password'
    })
});

router.get('/confirmation/:id', redirectDashboard, (req, res) =>{
    const token = req.params.id;
    const link ="mongodb://localhost:27017/";
    MongoClient.connect(link, { useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db('Aphrodite');
        dbo.collection('users').find({}).toArray(function(err, result) {
            if (err) return console.log(err);
            result.forEach((item, index, array) => {
                if (item.token === token) {
                    dbo.collection('users').updateOne(
                        { "confirmed" : item.confirmed, "token": token }, 
                        { $set: {"confirmed": "Yes", "token": ""} },
                        { upsert: true }
                        );
                        res.redirect('/login');
                    }
                });
                db.close();
            });
        });
    });
    
router.get('/logout', redirectLogin,  (req, res) => {
    req.logout();
    req.session.destroy();
    res.render('pages/index',{
        title:'Home',
        headed: 'Home'
    });
});

router.get('/user-profile', redirectLogin, (req, res) => {
    console.log(req.url);
    res.render('pages/user-profile', {
        headed: "User Profile"
    });
});

router.get('/reset-password', redirectDashboard, (req, res) => {
    res.render('pages/reset-password', {
        headed: 'Reset Password'
    })
});

/* function authenticationMiddleware () {
    return (req, res, next) => {
        console.log(`
        req.session.passport.user: ${JSON.stringify(req.session.passport)}
        `);
        if (req.isAuthenticated()) return next();
        
        res.redirect('/login')
    }
} */

passport.serializeUser((user_id, done) => {
    done(null, user_id);
});
  
passport.deserializeUser((user_id, done) => {
    done(null, user_id);
});

module.exports = router;