const { ObjectId } = require('mongodb');
const clientPromise = require('../lib/mongodb');
const { requireAuth } = require('../lib/auth');

async function getProducts(req, res) {
  try {
    const { brand, limit } = req.query;
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    let query = {};
    if (brand) {
      query.brand = new RegExp(brand, 'i');
    }
    
    let productsQuery = db.collection('products').find(query);
    
    if (limit) {
      productsQuery = productsQuery.limit(parseInt(limit));
    }
    
    const products = await productsQuery.toArray();
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function createProduct(req, res) {
  try {
    console.log('Creating product with data:', req.body);
    const { name, priceEGP, description, brand, sizes, colors, images } = req.body;
    
    if (!name || !priceEGP || !brand) {
      console.log('Missing required fields:', { name, priceEGP, brand });
      return res.status(400).json({ message: 'Name, price, and brand are required' });
    }
    
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    const product = {
      name,
      priceEGP: parseFloat(priceEGP),
      description: description || '',
      brand,
      sizes: sizes || [],
      colors: colors || [],
      images: images || [],
      soldOut: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Inserting product:', product);
    const result = await db.collection('products').insertOne(product);
    console.log('Product created with ID:', result.insertedId);
    
    res.status(201).json({ 
      message: 'Product created successfully', 
      productId: result.insertedId,
      product: { ...product, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return getProducts(req, res);
  } else if (req.method === 'POST') {
    return requireAuth(req, res, () => createProduct(req, res));
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};
