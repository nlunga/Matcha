const express = require('express');
const router = express.Router();
var bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const uuidv1 = require('uuid/v1');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const saltRounds = 10;
const emailToken = uuidv1();

router.post('/', (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let confPass = req.body.confPass;
    console.log(req.body);
    console.log("\nFirst Name: " + firstName);
    console.log("Last Name: " + lastName);
    console.log("Username: " + username);
    console.log("Email: " + email);
    console.log("Password: " + password);
    console.log("Confirmation Password: " + confPass);
});

module.exports = router;