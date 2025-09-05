const { ObjectId } = require('mongodb');
const clientPromise = require('../../lib/mongodb');
const { requireAuth } = require('../../lib/auth');

async function updateSoldOutStatus(req, res) {
  try {
    // Get ID from params (not query) since it's a path parameter
    const productId = req.params.id;
    const { soldOut } = req.body;
    
    console.log('Soldout API - Full req.query:', req.query);
    console.log('Soldout API - Full req.params:', req.params);
    console.log('Soldout API - Product ID from params:', productId);
    console.log('Soldout API - Product ID length:', productId?.length);
    console.log('Soldout API - Request body:', req.body);
    console.log('Soldout API - soldOut value:', soldOut, 'type:', typeof soldOut);
    
    if (!productId || productId.length !== 24 || !ObjectId.isValid(productId)) {
      console.log('Invalid product ID:', productId, 'length:', productId?.length);
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    if (typeof soldOut !== 'boolean') {
      console.log('Invalid soldOut type:', typeof soldOut, 'value:', soldOut);
      return res.status(400).json({ message: 'soldOut must be a boolean value' });
    }
    
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { 
        $set: { 
          soldOut,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ 
      message: `Product ${soldOut ? 'marked as sold out' : 'marked as available'}` 
    });
  } catch (error) {
    console.error('Error updating sold out status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'PATCH') {
    return requireAuth(req, res, () => updateSoldOutStatus(req, res));
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};
