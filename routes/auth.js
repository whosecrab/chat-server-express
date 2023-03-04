const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/user', auth, (req, res) => res.json(req.user));

router.post('/register', async (req, res) => {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(409).end();

    const { name, password } = req.body;
    const newUser = new User({
        name,
        email,
        password: bcrypt.hashSync(password, 10),
    });
    await newUser.save();
    res.end();
});

router.post('/login', passport.authenticate('local'), (_, res) => res.end());

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        successRedirect: process.env.CLIENT_URL,
    })
);

router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.end();
    });
});

module.exports = router;
