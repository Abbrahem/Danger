const { GridFSBucket, ObjectId } = require('mongodb');
const clientPromise = require('./lib/mongodb');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Extract image ID from URL
    const urlParts = req.url.split('/');
    const imageId = urlParts[urlParts.length - 1].split('?')[0];
    
    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' });
    }

    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    let objectId;
    try {
      objectId = new ObjectId(imageId);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid image ID format' });
    }

    // Check if file exists
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const file = files[0];
    
    // Set appropriate headers
    res.setHeader('Content-Type', file.contentType || 'image/jpeg');
    res.setHeader('Content-Length', file.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Stream the file
    const downloadStream = bucket.openDownloadStream(objectId);
    
    downloadStream.on('error', (error) => {
      console.error('GridFS download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error retrieving image' });
      }
    });

    downloadStream.pipe(res);
    
  } catch (error) {
    console.error('Images API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
