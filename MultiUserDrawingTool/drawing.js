const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let lastX = 0, lastY = 0;

// Connect to WebSocket server
const ws = new WebSocket('ws://localhost:9999');

ws.onopen = () => console.log('Connected to server');

ws.onmessage = async (msg) => {
    let text;
    // Convert Blob to text if necessary
    if (msg.data instanceof Blob) {
        text = await msg.data.text();
    } else {
        text = msg.data;
    }

    try {
        const data = JSON.parse(text);
        if (data.type === 'draw') {
            drawLine(data.x0, data.y0, data.x1, data.y1, data.color, false);
        }
    } catch (e) {
        console.error('Invalid JSON:', text);
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
    drawLine(lastX, lastY, e.offsetX, e.offsetY, 'black', true);
    lastX = e.offsetX;
    lastY = e.offsetY;
});

// Draw line and optionally emit to server
function drawLine(x0, y0, x1, y1, color, emit) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    if (!emit) return;

    // Send JSON string to server
    ws.send(JSON.stringify({ type: 'draw', x0, y0, x1, y1, color }));
}
