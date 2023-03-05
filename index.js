require('dotenv').config();
require('express-async-errors');
require('./config/passport');

const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { WebSocketServer } = require('ws');
const { handleUpgrade } = require('./websocket-server');
const authRouter = require('./routes/auth');
const auth = require('./middlewares/auth');
const chatsRouter = require('./routes/chats');

const app = express();
const port = process.env.PORT || 3001;

mongoose.set('strictQuery', false);

const clientPromise = mongoose
    .connect(process.env.MONGODB_URI)
    .then((m) => m.connection.getClient());

const sessionParser = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ clientPromise }),
});

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(sessionParser);
app.use(passport.authenticate('session'));
app.use('/', authRouter);
app.use('/chats', auth, chatsRouter);

const server = http.createServer(app);

server.on('upgrade', (request, socket, head) => {
    sessionParser(request, {}, () => {
        const user = request.session.passport?.user;

        if (!user) {
            socket.write('HTTP/1.1 401 Unauthorized');
            socket.destroy();
            return;
        }

        handleUpgrade(request, socket, head);
    });
});

server.listen(port, () => console.log(`Server listening on port ${port}`));
