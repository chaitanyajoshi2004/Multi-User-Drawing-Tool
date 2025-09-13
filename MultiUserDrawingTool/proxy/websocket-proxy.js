const net = require('net');
const WebSocket = require('ws');

const TCP_SERVER_HOST = '127.0.0.1';
const TCP_SERVER_PORT = 9999;
const WS_PORT = 8080;

const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);

wss.on('connection', (ws) => {
    const tcpClient = new net.Socket();
    tcpClient.connect(TCP_SERVER_PORT, TCP_SERVER_HOST, () => {
        console.log('Connected to TCP server');
    });

    ws.on('message', (msg) => tcpClient.write(msg));
    tcpClient.on('data', (data) => ws.send(data.toString()));

    ws.on('close', () => tcpClient.destroy());
    tcpClient.on('close', () => ws.close());
});
