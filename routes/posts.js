const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    res.render('pages/register-success', {
        headed: "Registration",
        data: req.body
    });
});

module.exports = router;