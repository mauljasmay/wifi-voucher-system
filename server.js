const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Configuration
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(path.join(logsDir, 'app.log'), logMessage);
  console.log(message);
}

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Error handling
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection: ${reason}`);
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Log requests
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      log(`${req.method} ${req.url} - IP: ${clientIP}`);
      
      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Handle request
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
      
    } catch (err) {
      log(`Error handling ${req.url}: ${err.message}`);
      console.error('Error occurred handling', req.url, err);
      
      // Send appropriate error response
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Internal Server Error',
          message: dev ? err.message : 'Something went wrong',
          timestamp: new Date().toISOString()
        }));
      }
    }
  }).listen(port, (err) => {
    if (err) {
      log(`Failed to start server: ${err.message}`);
      throw err;
    }
    
    log(`🚀 Server started successfully`);
    log(`📍 URL: http://${hostname}:${port}`);
    log(`🌍 Environment: ${dev ? 'development' : 'production'}`);
    log(`📊 Node.js version: ${process.version}`);
    log(`💾 Memory usage: ${JSON.stringify(process.memoryUsage())}`);
    
    // Health check endpoint
    log(`🏥 Health check available at: http://${hostname}:${port}/api/health`);
  });
}).catch((err) => {
  log(`Failed to prepare Next.js app: ${err.message}`);
  console.error('Failed to prepare Next.js app:', err);
  process.exit(1);
});