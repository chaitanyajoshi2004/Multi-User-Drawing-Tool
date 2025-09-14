// const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d');
// let drawing = false;
// let lastX = 0, lastY = 0;

// // Connect to WebSocket server
// const ws = new WebSocket('ws://localhost:9999');

// ws.onopen = () => console.log('Connected to server');

// ws.onmessage = async (msg) => {
//     let text;
//     // Convert Blob to text if necessary
//     if (msg.data instanceof Blob) {
//         text = await msg.data.text();
//     } else {
//         text = msg.data;
//     }

//     try {
//         const data = JSON.parse(text);
//         if (data.type === 'draw') {
//             drawLine(data.x0, data.y0, data.x1, data.y1, data.color, false);
//         }
//     } catch (e) {
//         console.error('Invalid JSON:', text);
//     }
// };

// // Mouse events
// canvas.addEventListener('mousedown', e => {
//     drawing = true;
//     lastX = e.offsetX;
//     lastY = e.offsetY;
// });

// canvas.addEventListener('mouseup', () => drawing = false);
// canvas.addEventListener('mouseout', () => drawing = false);

// canvas.addEventListener('mousemove', e => {
//     if (!drawing) return;
//     drawLine(lastX, lastY, e.offsetX, e.offsetY, 'black', true);
//     lastX = e.offsetX;
//     lastY = e.offsetY;
// });

// // Draw line and optionally emit to server
// function drawLine(x0, y0, x1, y1, color, emit) {
//     ctx.strokeStyle = color;
//     ctx.lineWidth = 2;
//     ctx.beginPath();
//     ctx.moveTo(x0, y0);
//     ctx.lineTo(x1, y1);
//     ctx.stroke();
//     ctx.closePath();

//     if (!emit) return;

//     // Send JSON string to server
//     ws.send(JSON.stringify({ type: 'draw', x0, y0, x1, y1, color }));
// }
// 🔗 Backend URLs (change to your Render URL)
const ws = new WebSocket("wss://multiuser-drawing-server.onrender.com");  // WebSocket server
const API_BASE = "https://multiuser-drawing-server.onrender.com/api/drawings"; // REST API

// Example: Load saved drawings on page load
fetch(API_BASE)
  .then(res => res.json())
  .then(data => console.log("Loaded drawings:", data));

const canvas = document.getElementById('canvas'); 
const ctx = canvas.getContext('2d');
let drawing = false;
let lastX = 0, lastY = 0;
let strokeId = 0;

ws.onopen = () => console.log('Connected to server');

// Handle server messages
ws.onmessage = async (msg) => {
    const text = msg.data instanceof Blob ? await msg.data.text() : msg.data;
    const data = JSON.parse(text);

    switch (data.type) {
        case 'init':
        case 'read':
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            data.drawings.forEach(s => drawLine(s.x0, s.y0, s.x1, s.y1, s.color, false));
            break;

        case 'create':
            drawLine(data.stroke.x0, data.stroke.y0, data.stroke.x1, data.stroke.y1, data.stroke.color, false);
            break;

        case 'delete':
            // Redraw after deletion
            fetch(API_BASE) // re-fetch drawings from backend
                .then(res => res.json())
                .then(drawings => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawings.forEach(s => drawLine(s.x0, s.y0, s.x1, s.y1, s.color, false));
                });
            break;

        case 'clear':
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            break;
    }
};

// Mouse events
canvas.addEventListener('mousedown', e => {
    drawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);

canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    const stroke = {
        id: ++strokeId,
        x0: lastX,
        y0: lastY,
        x1: e.offsetX,
        y1: e.offsetY,
        color: 'black'
    };
    drawLine(stroke.x0, stroke.y0, stroke.x1, stroke.y1, stroke.color, true, stroke);
    lastX = e.offsetX;
    lastY = e.offsetY;
});

// Draw helper
function drawLine(x0, y0, x1, y1, color, emit, stroke) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    if (emit && stroke) {
        ws.send(JSON.stringify({ type: 'create', stroke }));
    }
}

// Buttons
document.getElementById('clearBtn').onclick = () => {
    ws.send(JSON.stringify({ type: 'clear' }));
};

document.getElementById('undoBtn').onclick = () => {
    ws.send(JSON.stringify({ type: 'undo' }));
};

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'c') ws.send(JSON.stringify({ type: 'clear' }));
    if (e.key.toLowerCase() === 'u') ws.send(JSON.stringify({ type: 'undo' }));
});
