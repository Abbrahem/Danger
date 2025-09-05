const { ObjectId } = require('mongodb');
const clientPromise = require('../lib/mongodb');
const { requireAuth } = require('../lib/auth');

async function createOrder(req, res) {
  try {
    const { items, customer, shippingFee, total } = req.body;
    
    if (!items || !customer || !customer.name || !customer.address || !customer.phone1 || !customer.phone2) {
      return res.status(400).json({ message: 'Missing required order information' });
    }
    
    if (customer.phone1 === customer.phone2) {
      return res.status(400).json({ message: 'Phone numbers must be different' });
    }
    
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    const order = {
      items,
      customer,
      shippingFee: shippingFee || 120,
      total,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('orders').insertOne(order);
    
    res.status(201).json({ 
      message: 'Order created successfully', 
      orderId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getOrders(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    const orders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    return createOrder(req, res);
  } else if (req.method === 'GET') {
    return requireAuth(req, res, () => getOrders(req, res));
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
