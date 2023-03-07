const { Schema, model, ObjectId } = require('mongoose');

module.exports = model(
    'Message',
    new Schema(
        {
            userId: { type: ObjectId, required: true },
            content: { type: String, required: true },
        },
        {
            timestamps: true,
        }
    )
);
