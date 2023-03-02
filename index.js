require('dotenv').config();
require('express-async-errors');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const authRouter = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3001;

mongoose.set('strictQuery', false);

const clientPromise = mongoose
    .connect(process.env.MONGODB_URI)
    .then((m) => m.connection.getClient());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ clientPromise }),
    })
);

app.use(passport.authenticate('session'));

app.use('/', authRouter);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
