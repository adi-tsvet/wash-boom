// /pages/api/updates.js
export default function handler(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  
    // Send a heartbeat to keep the connection alive
    const interval = setInterval(() => {
      res.write('data: heartbeat\n\n');
    }, 10000);
  
    // Simulate sending data when a change is made
    setTimeout(() => {
      res.write('data: {"message": "Washroom status updated"}\n\n');
    }, 5000);
  
    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  }
  