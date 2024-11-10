
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => console.log('Connected to server');
ws.onmessage = (msg) => console.log('Received:', msg.data);
ws.onerror = (err) => console.error('WebSocket error:', err);
ws.onclose = () => console.log('Connection closed');

