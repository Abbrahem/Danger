const { ObjectId } = require('mongodb');
const { downloadFromGridFS } = require('../lib/gridfs');
const path = require('path');
const fs = require('fs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.params;
    console.log('Requested image ID:', id);
    
    // Handle both ObjectId and string IDs (for mock database)
    let downloadStream;
    try {
      if (ObjectId.isValid(id)) {
        console.log('Using ObjectId for:', id);
        downloadStream = await downloadFromGridFS(new ObjectId(id));
      } else {
        console.log('Using string ID for:', id);
        downloadStream = await downloadFromGridFS(id);
      }
    } catch (error) {
      console.error('Image download error for ID:', id, error.message);
      // Return default image instead of error
      return serveDefaultImage(res);
    }

    // Set content type from stream metadata or default
    if (downloadStream.contentType) {
      res.setHeader('Content-Type', downloadStream.contentType);
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    downloadStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        return serveDefaultImage(res);
      }
    });

    downloadStream.on('file', (file) => {
      res.setHeader('Content-Type', file.metadata?.contentType || 'image/jpeg');
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error serving image:', error);
    if (!res.headersSent) {
      return serveDefaultImage(res);
    }
  }
}

function serveDefaultImage(res) {
  try {
    console.log('Serving default image - this should not happen if images are uploaded correctly');
    const defaultImagePath = path.join(__dirname, '../../public/danger.jpg');
    if (fs.existsSync(defaultImagePath)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.sendFile(defaultImagePath);
    } else {
      // Create a simple 1x1 pixel transparent image
      const transparentPixel = Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00,
        0xFF, 0xFF, 0xFF, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3B
      ]);
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(transparentPixel);
    }
  } catch (err) {
    console.error('Error serving default image:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
