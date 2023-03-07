const express = require('express');
const Chat = require('../models/chat');
const Message = require('../models/message');

const router = express.Router();

router.get('/', async (req, res) => {
    const userId = req.session.passport.user;

    // TODO: store chat ids in user model
    const chats = await Chat.find({
        participants: { $in: [userId] },
    })
        .populate({ path: 'participants', match: { _id: { $ne: userId } } })
        .populate({
            path: 'messages',
            options: { sort: { createdAt: -1 }, limit: 1 },
        });

    const data = chats.map((chat) => ({
        id: chat._id,
        user: chat.participants[0],
        message: chat.messages[0]?.content || '',
    }));

    res.json(data);
});

router.get('/:chatId', async (req, res) => {
    const { chatId } = req.params;

    const { messages } = await Chat.findById(chatId).populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 5 },
    });

    // TODO: map messages
    res.json(messages);
});

router.post('/', async (req, res) => {
    // TODO: append "ids"
    // TODO: check if a chat already exists
    const participants = [req.body.senderId, req.body.receiverId];
    const chat = new Chat({ participants });

    const newChat = await chat.save();
    res.json(newChat);
});

module.exports = router;
