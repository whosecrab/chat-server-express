const { WebSocketServer, OPEN } = require('ws');
const Chat = require('./models/chat');
const Message = require('./models/message');

const wss = new WebSocketServer({ noServer: true });
const clients = new Map();

function handleUpgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
}

wss.on('connection', (ws, request) => {
    const userId = request.session.passport?.user;

    clients.set(userId, ws);

    ws.on('message', async (message) => {
        const { chatId, content } = JSON.parse(message);
        const chat = await Chat.findById(chatId);
        const participants = chat.participants.map(String);

        if (!participants.includes(userId)) return;

        const savedMessage = await new Message({ userId, content }).save();
        chat.messages.push(savedMessage.id);
        await chat.save();

        const mapped = participants
            .map(clients.get.bind(clients))
            .filter(Boolean);

        mapped.forEach((client) => {
            if (client.readyState !== OPEN) return;
            client.send(JSON.stringify(savedMessage));
        });

        // const receiver = clients.get(data.receiverId);

        // if (receiver.readyState !== WebSocket.OPEN) return;

        // TODO: store the message to a chat

        //receiver.send({ message: data.message });
    });

    ws.on('close', () => clients.delete(userId));
});

module.exports = { handleUpgrade };
