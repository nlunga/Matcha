const express = require('express');
const router = express.Router();
var mysql = require('mysql');
const passport = require('passport');
const bcrypt = require('bcrypt');
const multer = require('multer');
const nodemailer = require('nodemailer');
const uuidv1 = require('uuid/v1');
const saltRounds = 10;
const emailToken = uuidv1();
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    // destination: './public/uploads',
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        //   cb(null, file.fieldname + '-' + uniqueSuffix)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage 
}).single('myImage');

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

recon.connect((err) => {
    if (err) throw err;
});

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
                            
                            let user = req.session;
                            console.log('loggen in');
                            recon.query(`SELECT * FROM images WHERE username = ` + mysql.escape(result[0].username), (err, result) => {
                                if (err) throw err;
                                if (result.length === 0) {
                                    return console.log('Results not found');
                                }else if (result[0].username !== req.session.username) {
                                    return console.log('Results not found');
                                }else {
                                    var imageData = result[0].imagePath.split('./public');
                                    req.session.image = imageData[1];
                                }
                            });

                            recon.query(`SELECT * FROM userInfo WHERE username = ` + mysql.escape(result[0].username) + `LIMIT 1`, (err, result) => {
                                if (err) throw err;
                                if (result.length === 0) {
                                    res.render('pages/user-profile', {
                                        headed: "User Profile",
                                        data: user
                                    });
                                }else if (result[0].username !== req.session.username) {
                                    res.render('pages/user-profile', {
                                        headed: "User Profile",
                                        data: user
                                    });
                                }else {
                                    req.session.age = result[0].age;
                                    req.session.gender = result[0].gender;
                                    req.session.sexualOrientation = result[0].sexualOrientation;
                                    req.session.bio = result[0].bio;
                                    req.session.interest = result[0].interest;
                                    return res.redirect('/dashboard');
                                }
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
    const userData = req.session;
    var arr = userData.interest.split(",");
    var ret = [];
    arr.forEach(element => {
        var temp = element.trim();
        ret.push(temp);

    });
    res.render('pages/profile', {
        headed: "profile",
        data: userData,
        interestValues: ret
    });
});

router.get('/set-profilePic', redirectLogin, (req, res) => {
    const userData = req.session;
    // var arr = userData.interest.split(",");
    // var ret = [];
    // arr.forEach(element => {
    //     var temp = element.trim();
    //     ret.push(temp);

    // });
    res.render('pages/profile-pic', {
        headed: "Profile Pic",
        data: userData,
        // interestValues: ret
    });
});
router.post('/set-profilePic', (req, res) => {
    upload(req, res, (err) => {
        if (err) throw err;
        const imageName = `${req.file.destination}/${req.file.filename}`;
        /* console.log(req.file);
        console.log(imageName); */
        const sql = `INSERT INTO images(imagePath, username) VALUES (?, ?)`;
        recon.query(sql, [imageName, req.session.username], (err, result) => {
            if (err) throw err;
            console.log('1 Document inserted');
            return res.redirect('/dashboard');
        })
    });
});

router.get('/reset-password', redirectDashboard, (req, res) => {
    res.render('pages/reset-password', {
        headed: 'Reset Password'
    })
});

router.get('/confirmation/:id', redirectDashboard, (req, res) =>{
    let token = req.params.id;
    let sql = `UPDATE users SET verified = 1 WHERE token = '${token}'`;
    recon.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
        return res.redirect('/login');
    });
});

router.post('/upload', (req, res) => {
    console.log(req.body);
});
    
router.get('/logout', redirectLogin,  (req, res) => {
    req.session.destroy( (err) => {
        if (err) return res.redirect('/dashboard');
        // res.clearCookie(SESS_NAME);
        res.clearCookie('sid');
        res.redirect('/login')
    });
});

router.get('/user-profile', redirectLogin, (req, res) => {
    // console.log(req.url);
    
    recon.query(`SELECT * FROM images WHERE username = ` + mysql.escape(req.session.username), (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            req.session.link = '/dashboard';
        }else if (result[0].username !== req.session.username) {
            req.session.link = '/dashboard';
        }else {
            var imageData = result[0].imagePath.split('./public');
            req.session.image = imageData[1];
        }
    });
    const user = req.session;
    res.render('pages/user-profile', {
        headed: "User Profile",
        data: user
    });
});

router.post('/user-profile', (req, res) => {
    console.log(req.body);
    // res.send(req.body);
    if (req.body) { // TODO I must do proper validation
        recon.query("INSERT INTO userInfo (age, gender, sexualOrientation, bio, interest, username) VALUES (?, ?, ?, ?, ?, ?)", [req.body.age, req.body.gender, req.body.sexualOrientation, req.body.bio, req.body.interests, req.body.username], (err, result) => {
            if (err) throw err;
            console.log("1 record inserted");
            return res.redirect('/set-profilePic');// TODO set up an if statement to route to dashboard
        });
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