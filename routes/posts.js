const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    // const schema = joi.object().keys({
    //     username: Joi.string().alphanum().min(3).max(30).required(),
    //     email : joi.string().trim().email().required(),
    //     password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    //     confPass: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
    // });
    // joi.validate(req.body, schema, (err, data) => {
    //     if (err) {
    //         res.send("An error has occured.");
    //         console.log(err);
    //     }
    //     res.send("Successfully added.");
    //     console.log(data);
    // });
    res.render('pages/register-success', {
        headed: "Registration",
        data: req.body
    });
});

module.exports = router;