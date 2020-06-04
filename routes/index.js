const express = require('express');
const router = express.Router();
var mysql = require('mysql');
const passport = require('passport');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const uuidv1 = require('uuid/v1');
const saltRounds = 10;
const emailToken = uuidv1();

const {
    PORT = 3000,
    HOST = 'localhost',
    USER = 'root',
    PASSWORD = '',
    DB_NAME = 'Aphrodite',
    SESS_SECRET = 'haoPsURXAFxeB0ph',
    NODE_ENV = 'development'
} = process.env;

var recon = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DB_NAME
});

// recon.connect();

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
        data: userId
    });
});

router.get('/signup', redirectDashboard, (req, res) => {
    res.render('pages/signup',{
        title:'Register an account',
        headed: 'Sign Up'
    });
});

router.post('/signup', redirectDashboard, (req, res) => {
    console.log(req.body);
    let namePattern = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g;
    let lastNamePattern = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g;
    let usernamePattern = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{4,29}$/i;
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
        
    if (/* req.body */firstNameResult === true && lastNameResult === true && usernameResult === true && emailResult === true && passwordResult === true && confPasswordResult === true) {
        console.log(req.body);
        recon.connect((err) => {
            if (err) throw err;
            bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                var confirmed = 0;
                recon.query("INSERT INTO users (firstName, lastName, userName, email, password, verified, token) VALUES (?, ?, ?, ?, ?, ?, ?)", [req.body.firstName, req.body.LastName, req.body.username, req.body.email, hash, confirmed, emailToken], (err, result) => {
                    if (err) throw err;
                    console.log("1 record inserted");
                });

                const transporter = nodemailer.createTransport({
                    secure: true,
                    service: 'gmail',
                    auth: {
                        user: 'nlunga@student.wethinkcode.co.za',
                        pass: '9876543210khulu'
                    },
                    tls: {
                        // do not fail on invalid certs
                        rejectUnauthorized: false
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

                res.render('pages/register-success', {
                    headed: "Registration",
                    data: req.body
                });
            });
        });
    }else {
        console.log('Invalid input');
    }
});

router.get('/login', redirectDashboard, (req, res) => {
    res.render('pages/login',{
        title:'login',
        headed: 'Login'
    });
});

router.post('/login', redirectDashboard/*, redirectUserProfile*/, (req, res) => { //TODO : Fix the middleware above called redirectUserProfile

    let usernamePattern = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{4,29}$/i;
    let strongPassPattern = /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/g;

    let usernameResult = usernamePattern.test(req.body.username);
    let passwordResult = strongPassPattern.test(req.body.password);

    if (usernameResult === true && passwordResult === true) {
        recon.connect((err) => {
            if (err) throw err;
            let sql = `SELECT * FROM users WHERE username = ` + mysql.escape(req.body.username);
            recon.query(sql, (err, result) => {
                if (err) throw err;
                if (result[0].username === req.body.username && req.body.password) {
                    const hash = result[0].password;
                            
                    bcrypt.compare(req.body.password, hash, (err, response) => {
                        if (result[0].verified === 0) {
                            console.log("Please confirm your email");
                            res.redirect("/login");
                        }else if (result[0].verified === 1) {
                            if (response === true) {
                                req.session.userId = result[0].id;
                                req.session.firstName = result[0].firstName;
                                req.session.lastName = result[0].lastName;
                                req.session.username = result[0].username;
                                req.session.email = result[0].email;
                                req.session.password = result[0].password;
                                /* req.session.age = result[0].userInfo.age;
                                req.session.gender = result[0].userInfo.gender;
                                req.session.sexualOrientation = result[0].userInfo.sexualOrientation;
                                req.session.bio = result[0].userInfo.bio;
                                req.session.interest = result[0].userInfo.interest; */
                                let user = req.session;
                                console.log('loggen in');
                                // recon.query(`SELECT * FROM userInfo WHERE username = ` + mysql.escape(result[0].username) + `LIMIT 1`, (err, result) => {
                                recon.query(`SELECT * FROM userInfo`, (err, result) => {
                                    if (err) throw err;
                                    console.log(result);
                                    /* if (result[0].age === undefined && result[0].gender === undefined && result[0].sexualOrientation === undefined && result[0].bio === undefined && result[0].interest === undefined) {
                                            res.render('pages/user-profile', {
                                                headed: "User Profile",
                                                data: user
                                            });
                                            return 0;
                                    }else {
                                        return res.redirect('/dashboard');
                                    } */
                                });
                               
                                // });
                                // return res.redirect('/dashboard');
                            }else {
                                res.redirect("/login");
                                return console.log('password does not match');
                            }
                        }
                    });
                }
                console.log(result[0].id);
                console.log(result[0]);
            });
        });
    }else {
        console.log("Invalid input");
    }

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
    let token = req.params.id;
    recon.connect((err) => {
        if (err) throw err;
        let sql = `UPDATE users SET verified = 1 WHERE token = '${token}'`;
        recon.query(sql, (err, result) => {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
          return res.redirect('/login');
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

router.post('/user-profile', (req, res) => {
    console.log(req.body);
    if (req.body) { // TODO I must do proper validation
        /* MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
            if (err) throw err;
            let dbo = db.db('Aphrodite');
            var myQuery = { username: req.body.username };
            let newValues = { $set: { "userInfo.age": req.body.age, "userInfo.gender": req.body.gender, "userInfo.sexualOrientation": req.body.sexualOrientation, "userInfo.bio": req.body.bio, "userInfo.interest": req.body.interests.split(",")} };
            dbo.collection('users').find({username: req.body.username} , { projection: { _id: 0, firstName: 0, lastName: 0, email: 0, password: 0, confirmed: 0, token: 0 } }).toArray(
                (err, result) => {
                if (err) throw err;
                result.forEach((item, index, array) => {
                    if (item.userInfo.age === null && item.userInfo.gender === null && item.userInfo.sexualOrientation === null && item.userInfo.bio === null && item.userInfo.interest === null) {
                        dbo.collection("users").updateOne(myQuery, newValues, (err, data) => {
                            if (err) throw err;
                            console.log('1 document updated');
                            return res.redirect('/dashboard');
                        });
                    }else {
                        return res.redirect('/dashboard'); // TODO fix this code
                    }
                    // if (item.username === req.body.username) {
                    //     return console.log('The user already exist');
                    // }else {
                    //     if (array.length === result.length) {
                    //         console.log(index + " " + item.username);
                    //         dbo.collection('userInfo').insertOne(newValues, (err, data) => {// TODO edit this code in order to debug the problem
                    //             if (err) throw err;
                    //             console.log('1 document inserted');
                    //             // db.close();
                    //         });
                    //     }
                    // } 
                    console.log(item);
                });
                
                db.close();
            });
        }); */
    }else {
        console.log('Invalid input');
    }
});

router.get('/add_interest', redirectLogin, (req, res) => {
    const user = req.session;
    res.render('pages/add-interest', {
        headed: "Interests",
        data: user
    });
});

router.get('/reset-password', redirectDashboard, (req, res) => {
    res.render('pages/reset-password', {
        headed: 'Reset Password'
    })
});

router.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE IF NOT EXISTS Aphrodite';
    recon.query(sql, (err, result) => {
        if (err) throw err;
        res.send(`Database created...`);
    });
});

router.get('/dropdb', (req, res) => {
    let sql = 'DROP DATABASE IF EXISTS Aphrodite';
    recon.query(sql, (err, result) => {
        if (err) throw err;
        res.send(`Database deleted...`);
    });
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