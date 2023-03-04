const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            const user = await User.findOne({ email })
                .select('+password')
                .exec();

            if (!user) return done(null, false);

            const match = await bcrypt.compare(password, user.password);
            if (!match) return done(null, false);

            user.password = undefined;
            done(null, user);
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (_, __, profile, done) => {
            const { email, name, picture } = profile._json;

            const user = await User.findOne({ email });

            if (user) return done(null, user);

            const newUser = new User({ email, name, picture });
            await newUser.save();

            done(null, newUser);
        }
    )
);

passport.serializeUser((user, done) => done(null, user.email));

passport.deserializeUser(async (email, done) => {
    const user = await User.findOne({ email });
    if (!user) return done(new Error('User not found'));
    done(null, user);
});

const router = express.Router();

router.get('/user', (req, res) => {
    const { user } = req;

    if (!user) return res.status(401).end();

    res.json(user);
});

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

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
});

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
