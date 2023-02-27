const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(409).end();

    const { username, password } = req.body;
    const newUser = new User({
        username,
        email,
        password: bcrypt.hashSync(password, 10),
    });
    await newUser.save();
    res.end();
});

module.exports = router;
