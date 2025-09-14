// const http = require('http');
// const fs = require('fs');
// const path = require('path');
// const WebSocket = require('ws');

// // HTTP server to serve HTML & JS
// const server = http.createServer((req, res) => {
//     let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
//     const extname = path.extname(filePath);
//     const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
//     const contentType = mimeTypes[extname] || 'text/plain';

//     fs.readFile(filePath, (err, content) => {
//         if (err) {
//             res.writeHead(404);
//             res.end('Error loading file: ' + filePath);
//             return;
//         }
//         res.writeHead(200, { 'Content-Type': contentType });
//         res.end(content, 'utf-8');
//     });
// });

// // Start server on port 9999
// server.listen(9999, () => console.log('HTTP + WS server running on http://localhost:9999'));

// // WebSocket server
// const wss = new WebSocket.Server({ server });

// wss.on('connection', ws => {
//     console.log('New client connected');

//     ws.on('message', msg => {
//         // Ensure we broadcast only strings
//         let data;
//         try {
//             data = typeof msg === 'string' ? msg : msg.toString();
//         } catch (e) {
//             console.log('Invalid message format');
//             return;
//         }
//         // Broadcast to all clients
//         wss.clients.forEach(client => {
//             if (client.readyState === WebSocket.OPEN) client.send(data);
//         });
//     });

//     ws.on('close', () => console.log('Client disconnected'));
// });


const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid'); // for unique IDs

let drawings = [];

// HTTP server
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ico': 'image/x-icon' };
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

server.listen(9999, () => console.log('Server running on http://localhost:9999'));

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    const clientId = uuidv4();
    ws.clientId = clientId;
    console.log('New client connected:', clientId);

    // Send existing drawings
    ws.send(JSON.stringify({ type: 'init', drawings }));

    ws.on('message', msg => {
        let data;
        try {
            data = JSON.parse(msg.toString());
        } catch (e) {
            console.error('Invalid JSON received');
            return;
        }

        switch (data.type) {
            case 'create':
                const stroke = { ...data.stroke, clientId };
                drawings.push(stroke);
                broadcast(JSON.stringify({ type: 'create', stroke }));
                break;

            case 'read':
                ws.send(JSON.stringify({ type: 'read', drawings }));
                break;

            case 'undo':
                // Find last stroke by this client
                for (let i = drawings.length - 1; i >= 0; i--) {
                    if (drawings[i].clientId === clientId) {
                        const deleted = drawings.splice(i, 1)[0];
                        broadcast(JSON.stringify({ type: 'delete', id: deleted.id }));
                        break;
                    }
                }
                break;

            case 'clear':
                drawings = [];
                broadcast(JSON.stringify({ type: 'clear' }));
                break;
        }
    });

    ws.on('close', () => console.log('Client disconnected:', clientId));
});

function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
