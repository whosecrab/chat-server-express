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
