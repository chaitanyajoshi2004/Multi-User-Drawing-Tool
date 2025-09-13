const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// HTTP server to serve HTML & JS
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
    const contentType = mimeTypes[extname] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Error loading file: ' + filePath);
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    });
});

// Start server on port 9999
server.listen(9999, () => console.log('HTTP + WS server running on http://localhost:9999'));

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('New client connected');

    ws.on('message', msg => {
        // Ensure we broadcast only strings
        let data;
        try {
            data = typeof msg === 'string' ? msg : msg.toString();
        } catch (e) {
            console.log('Invalid message format');
            return;
        }
        // Broadcast to all clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(data);
        });
    });

    ws.on('close', () => console.log('Client disconnected'));
});
