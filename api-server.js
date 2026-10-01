// Motion Dice API
// Run with: node api-server.js
// The Ionic app automatically uses the same PC hostname on port 3000.

const http = require('http');

const PORT = 3000;
let rollNumber = 0;

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === 'GET' && req.url === '/api/status') {
    sendJson(res, 200, {
      status: 'ok',
      service: 'Motion Dice API',
      port: PORT
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/roll') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      let sides = 6;

      try {
        const data = body ? JSON.parse(body) : {};
        if (Number.isInteger(data.sides) && data.sides >= 2 && data.sides <= 100) {
          sides = data.sides;
        }
      } catch {
        // Use the default six-sided die.
      }

      const result = Math.floor(Math.random() * sides) + 1;
      rollNumber++;

      sendJson(res, 200, {
        result,
        sides,
        rollNumber,
        timestamp: new Date().toISOString()
      });
    });

    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Motion Dice API running on http://0.0.0.0:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/status`);
  console.log(`  POST /api/roll`);
});
