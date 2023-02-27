const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, select: false },
    picture: String,
});

module.exports = mongoose.model('User', UserSchema);
