const { ObjectId } = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { requireAuth } = require('./lib/auth');

module.exports = async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('danger-sneakers');
  
  // Parse URL to determine action
  const urlParts = req.url.split('/');
  const productId = urlParts[urlParts.length - 1].split('?')[0];
  const isSoldOutEndpoint = req.url.includes('/soldout');
  const isProductIdEndpoint = productId && productId !== 'products' && !req.url.endsWith('/products');

  try {
    // GET /api/products - Get all products
    if (req.method === 'GET' && !isProductIdEndpoint) {
      const limit = req.query?.limit ? parseInt(req.query.limit) : undefined;
      let products = await db.collection('products').find({}).toArray();
      
      if (limit) {
        products = products.slice(0, limit);
      }
      
      return res.status(200).json(products);
    }

    // GET /api/products/[id] - Get single product
    if (req.method === 'GET' && isProductIdEndpoint && !isSoldOutEndpoint) {
      let product;
      
      try {
        product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      } catch (error) {
        product = await db.collection('products').findOne({ _id: productId });
      }
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      return res.status(200).json(product);
    }

    // POST /api/products - Create new product
    if (req.method === 'POST' && !isProductIdEndpoint) {
      return requireAuth(req, res, async () => {
        const { name, priceEGP, description, brand, sizes, colors, images } = req.body;

        if (!name || !priceEGP || !brand) {
          return res.status(400).json({ message: 'Name, price, and brand are required' });
        }

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

        const result = await db.collection('products').insertOne(product);
        return res.status(201).json({ 
          message: 'Product created successfully',
          productId: result.insertedId
        });
      });
    }

    // PUT /api/products/[id] - Update product
    if (req.method === 'PUT' && isProductIdEndpoint && !isSoldOutEndpoint) {
      return requireAuth(req, res, async () => {
        const { name, priceEGP, description, brand, sizes, colors, images } = req.body;

        const updateData = {
          ...(name && { name }),
          ...(priceEGP && { priceEGP: parseFloat(priceEGP) }),
          ...(description !== undefined && { description }),
          ...(brand && { brand }),
          ...(sizes && { sizes }),
          ...(colors && { colors }),
          ...(images && { images }),
          updatedAt: new Date()
        };

        let result;
        try {
          result = await db.collection('products').updateOne(
            { _id: new ObjectId(productId) },
            { $set: updateData }
          );
        } catch (error) {
          result = await db.collection('products').updateOne(
            { _id: productId },
            { $set: updateData }
          );
        }

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product updated successfully' });
      });
    }

    // DELETE /api/products/[id] - Delete product
    if (req.method === 'DELETE' && isProductIdEndpoint) {
      return requireAuth(req, res, async () => {
        let result;
        try {
          result = await db.collection('products').deleteOne({ _id: new ObjectId(productId) });
        } catch (error) {
          result = await db.collection('products').deleteOne({ _id: productId });
        }

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product deleted successfully' });
      });
    }

    // PATCH /api/products/[id]/soldout - Toggle sold out status
    if (req.method === 'PATCH' && isSoldOutEndpoint) {
      return requireAuth(req, res, async () => {
        const { soldOut } = req.body;

        if (typeof soldOut !== 'boolean') {
          return res.status(400).json({ message: 'soldOut must be a boolean value' });
        }

        let result;
        try {
          result = await db.collection('products').updateOne(
            { _id: new ObjectId(productId) },
            { $set: { soldOut, updatedAt: new Date() } }
          );
        } catch (error) {
          result = await db.collection('products').updateOne(
            { _id: productId },
            { $set: { soldOut, updatedAt: new Date() } }
          );
        }

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ 
          message: 'Product status updated successfully',
          soldOut 
        });
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
