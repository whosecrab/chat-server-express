const { WebSocketServer, OPEN } = require('ws');

const wss = new WebSocketServer({ noServer: true });
const clients = new Map();
// const chatListClients = new Map();
// const chatClients = new Map();

function handleUpgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
}

wss.on('connection', (ws, request) => {
    const userId = request.session.passport?.user;

    clients.set(userId, ws);

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        clients.forEach((client) => {
            if (client.readyState !== OPEN) return;
            client.send(JSON.stringify(data.text));
        });

        // const receiver = clients.get(data.receiverId);

        // if (receiver.readyState !== WebSocket.OPEN) return;

        // TODO: store the message to a chat

        //receiver.send({ message: data.message });
    });

    ws.on('close', () => clients.delete(userId));
});

module.exports = { handleUpgrade };
