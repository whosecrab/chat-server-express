const express = require('express');
const Chat = require('../models/chat');
const Message = require('../models/message');

const router = express.Router();

router.get('/:id', async (req, res) => {
    const { messages } = await Chat.findById(req.params.id)
        .slice('messages', -5)
        .exec();

    const result = await Message.find({
        _id: {
            $in: messages,
        },
    });

    res.json(result);
});

router.post('/', async (req, res) => {
    const chat = new Chat({
        participants: [req.body.senderId, req.body.receiverId],
    });

    const newChat = await chat.save();
    res.json(newChat);
});

router.post('/:userId', async (req, res) => {
    const chats = await Chat.find({
        participants: { $in: [req.params.userId] },
    });

    res.json(chats);
});

module.exports = router;
