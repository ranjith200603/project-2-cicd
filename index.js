const http = require('node:http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'healthy' }));
    return;
  }

  if (req.url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({
      application: 'Project 2 CI/CD',
      version: process.env.APP_VERSION || 'local',
      message: 'Application running successfully'
    }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Project 2 app listening on port ${PORT}`);
  });
}

module.exports = server;
