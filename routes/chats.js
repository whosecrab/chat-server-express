const express = require('express');
const Chat = require('../models/chat');

const router = express.Router();

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
