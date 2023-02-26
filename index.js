require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;

mongoose.set('strictQuery', false);

const clientPromise = mongoose
    .connect(process.env.MONGODB_URI)
    .then((m) => m.connection.getClient());

app.get('/', (_, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
