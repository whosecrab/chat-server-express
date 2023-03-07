const { Schema, model, ObjectId } = require('mongoose');

module.exports = model(
    'Chat',
    new Schema({
        participants: {
            type: [ObjectId],
            ref: 'User',
            validate: (value) => Array.isArray(value) && value.length === 2,
        },
        messages: [{ type: ObjectId, ref: 'Message' }],
    })
);
