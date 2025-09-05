const { ObjectId } = require('mongodb');
const clientPromise = require('../lib/mongodb');
const { requireAuth } = require('../lib/auth');

async function updateOrderStatus(req, res) {
  try {
    // Get ID from params (not query) since it's a path parameter
    const orderId = req.params.id;
    const { status } = req.body;

    console.log('Order status API - Full req.query:', req.query);
    console.log('Order status API - Full req.params:', req.params);
    console.log('Order status API - Order ID from params:', orderId);
    console.log('Order status API - Order ID length:', orderId?.length);
    console.log('Order status API - Request body:', req.body);
    console.log('Order status API - Status value:', status, 'type:', typeof status);

    if (!orderId || orderId.length !== 24 || !ObjectId.isValid(orderId)) {
      console.log('Invalid order ID:', orderId, 'length:', orderId?.length);
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    if (!status) {
      console.log('Missing status in request body');
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'PATCH') {
    return requireAuth(req, res, () => updateOrderStatus(req, res));
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
