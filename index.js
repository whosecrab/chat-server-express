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
const authRouter = require('./routes/auth');

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

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
    sessionParser(request, {}, () => {
        const user = request.session.passport?.user;

        if (!user) {
            socket.write('HTTP/1.1 401 Unauthorized');
            socket.destroy();
            return;
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request, { user });
        });
    });
});

wss.on('connection', (ws, request) => {
    ws.on('error', console.error);

    ws.on('message', (data) => {
        console.log(`Received message ${data} from user ${client}`);
    });
});

server.listen(port, () => console.log(`Server listening on port ${port}`));
