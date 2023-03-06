const { Schema, model, ObjectId } = require('mongoose');

module.exports = model(
    'Chat',
    new Schema({
        participants: {
            type: [ObjectId],
            // TODO: revert to 2 after "create chat" has been added
            validate: (value) => Array.isArray(value) && value.length,
            // validate: (value) => Array.isArray(value) && value.length === 2,
        },
        messages: [ObjectId],
    })
);
