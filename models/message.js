const { Schema, model, ObjectId } = require('mongoose');

module.exports = model(
    'Chat',
    new Schema({
        chatId: { type: ObjectId, required: true },
        userId: { type: ObjectId, required: true },
        content: { type: String, required: true },
    })
);
