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
/////////////////////////////////////////////////////////////////////////
// Revisite the middleware below -:> It is used on the login route
/* const redirectUserProfile = (req, res, next) => {
    const username = req.session.username;
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db('Aphrodite');
        dbo.collection('userInfo').find({}).toArray((err, result) => {
            if (err) throw err;
            result.forEach((item, index, array) => {
                if (item.username === username) {
                    return res.redirect('/dashboard');
                }
            });
            res.redirect('/user-profile');
        });
    });
    next();
} */
///////////////////////////////////////////////////////////////////////

router.get('/', (req, res) => {
    const userId = req.session;
    res.render('pages/index',{
        title:'Customers',
        headed: 'Home',
        dod : userId
    });
});

router.get('/index', (req, res) => {
    const userId = req.session;
    // const user = res.locals;
    res.render('pages/index',{
        title:'Customers',
        headed: 'Home',
        dod : userId
    });
});

router.get('/dashboard', redirectLogin, (req, res) => {
    // const user = res.locals;
    const userId = req.session;
    res.render('pages/suggestion', {
        headed: 'Dashboard',
        dot: userId
    });
});

router.get('/signup', redirectDashboard, (req, res) => {
    res.render('pages/signup',{
        title:'Register an account',
        headed: 'Sign Up'
    });
});

router.post('/signup', redirectDashboard, (req, res) => {
    let namePattern = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g;
    let lastNamePattern = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g;
    let usernamePattern = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/i;
    let emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\")){3,40}@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,6})$/i;
    let strongPassPattern = /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/g;
    let confStrongPassPattern = /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/g;
    
    let firstNameResult = namePattern.test(req.body.firstName);
    let lastNameResult = lastNamePattern.test(req.body.LastName);
    let usernameResult = usernamePattern.test(req.body.username);
    let emailResult = emailPattern.test(req.body.email);
    let passwordResult = strongPassPattern.test(req.body.password);
    let confPasswordResult = confStrongPassPattern.test(req.body.confPass);
    // console.log(req.body);
    console.log(req.body.password);
    console.log(req.body.confPass+ " " + strongPassPattern.test(req.body.confPass));
    console.log(req.body.confPass+ " " + strongPassPattern.test(req.body.confPass));

    /* let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let confPass = req.body.confPass; */

        // console.log(data);
        
    if (firstNameResult === true && lastNameResult === true && usernameResult === true && emailResult === true && passwordResult === true && confPasswordResult === true) { // TODO: validation
        console.log(req.body);
        MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
            if (err) return console.log(err);
            bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                const dbo = db.db('Aphrodite');
                const mydata = {firstName: req.body.firstName, lastName: req.body.LastName, username: req.body.username, email: req.body.email, password: hash, confirmed: "No", token: emailToken};
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
                        // console.logg("This is " + _id);
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
    }else {
        console.log('Invalid input');
        console.log("This is the first name " + firstNameResult);
        console.log("This is the last name " + lastNameResult);
        console.log("This is the username " + usernameResult);
        console.log("This is the email " + emailResult);
        console.log("This is the Password " + passwordResult);
        console.log("This is the conf password " + confPasswordResult);
    }
});

router.get('/login', redirectDashboard, (req, res) => {
    res.render('pages/login',{
        title:'login',
        headed: 'Login'
    });
});

router.post('/login', redirectDashboard/*, redirectUserProfile*/, (req, res) => { //TODO : Fix the middleware above called redirectUserProfile

    let usernamePattern = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/i;
    let strongPassPattern = /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/g;

    let usernameResult = usernamePattern.test(req.body.username);
    let passwordResult = strongPassPattern.test(req.body.password);

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
                                req.session.firstName = item.firstName;
                                req.session.lastName = item.lastName;
                                req.session.username = item.username;
                                req.session.email = item.email;
                                req.session.password = item.password;
                                req.session.confPass = item.confPass;
                                let user = req.session;
                                console.log('loggen in');
                                MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
                                    if (err) throw err;
                                    const dbo = db.db('Aphrodite');
                                    dbo.collection('userInfo').find({}).toArray((err, result) => {
                                        if (err) return console.log("This is a BIG ERROR >>>>\n" + err);

                                        result.forEach((item, index, array) => {
                                            if (item.username === req.body.username) {
                                                return res.redirect('/dashboard');
                                            }
                                        });
                                        console.log("This is the user " + user);
                                        return res.render('pages/user-profile', {
                                            headed: "User Profile",
                                            data: user
                                        });
                                    });
                                });
                                // return res.redirect('/dashboard');
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
    // console.log(req.url);
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
    req.session.destroy( (err) => {
        if (err) return res.redirect('/dashboard');
        res.clearCookie(SESS_NAME);
        res.redirect('/login')
    });
});

router.get('/user-profile', redirectLogin, (req, res) => {
    // console.log(req.url);
    const user = req.session;
    res.render('pages/user-profile', {
        headed: "User Profile",
        data: user
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