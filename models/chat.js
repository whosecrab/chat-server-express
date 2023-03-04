const { Schema, model, ObjectId } = require('mongoose');

module.exports = model(
    'Chat',
    new Schema({
        participants: {
            type: [ObjectId],
            validate: (value) => Array.isArray(value) && value.length === 2,
        },
    })
);
