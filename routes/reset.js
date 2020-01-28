const express = require('express');
const router = express.Router();
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const url = "mongodb://localhost:27017/";

router.post('/', (req, res) => {
    console.log(req.url + " " + req.param.id);
});

module.exports = router;