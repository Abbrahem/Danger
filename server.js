const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// API Routes - dynamically load all API files
const apiPath = path.join(__dirname, 'api');

// Function to recursively load API routes
function loadApiRoutes(dir, basePath = '/api') {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively load subdirectories
      loadApiRoutes(filePath, `${basePath}/${file}`);
    } else if (file.endsWith('.js') && !file.includes('lib')) {
      try {
        const route = require(filePath);
        const routeName = file === 'index.js' ? '' : `/${file.replace('.js', '')}`;
        const fullPath = `${basePath}${routeName}`;
        
        // Handle dynamic routes like [id].js and nested routes like [id]/soldout.js
        const dynamicPath = fullPath.replace(/\[([^\]]+)\]/g, ':$1');
        
        // Check if route is a function (middleware) or has default export
        if (typeof route === 'function') {
          app.all(dynamicPath, route);
          console.log(`✅ Loaded API route: ${dynamicPath} (ALL methods)`);
        } else if (route.default && typeof route.default === 'function') {
          app.all(dynamicPath, route.default);
          console.log(`✅ Loaded API route: ${dynamicPath} (ALL methods)`);
        } else if (typeof route === 'object' && route.handler && typeof route.handler === 'function') {
          app.all(dynamicPath, route.handler);
          console.log(`✅ Loaded API route: ${dynamicPath} (ALL methods)`);
        } else {
          console.log(`⚠️ Skipped ${filePath}: Not a valid middleware function`);
        }
      } catch (error) {
        console.error(`❌ Error loading ${filePath}:`, error.message);
      }
    }
  });
}

// Add a test route
app.get('/', (req, res) => {
  res.json({ message: 'Danger Sneakers API Server', status: 'running' });
});

// Load all API routes
loadApiRoutes(apiPath);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Don't crash the server on errors
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log the error
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend: http://localhost:${PORT}`);
});

module.exports = app;
