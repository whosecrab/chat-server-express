const { Schema, model, ObjectId } = require('mongoose');

module.exports = model(
    'User',
    new Schema({
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, select: false },
        picture: String,
    })
);
