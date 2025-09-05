const { ObjectId } = require('mongodb');
const clientPromise = require('../lib/mongodb');
const { requireAuth } = require('../lib/auth');

async function getProduct(req, res) {
  try {
    const { id } = req.params;
    
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    let product = null;
    
    // Try to find by ObjectId first (for MongoDB documents)
    if (ObjectId.isValid(id)) {
      product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    }
    
    // If not found and not a valid ObjectId, try to find by string ID (for development/mock data)
    if (!product) {
      product = await db.collection('products').findOne({ _id: id });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, priceEGP, description, brand, sizes, colors, images } = req.body;
    
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (priceEGP) updateData.priceEGP = parseFloat(priceEGP);
    if (description !== undefined) updateData.description = description;
    if (brand) updateData.brand = brand;
    if (sizes) updateData.sizes = sizes;
    if (colors) updateData.colors = colors;
    if (images) updateData.images = images;
    
    let result;
    // Try ObjectId first, then string ID
    if (ObjectId.isValid(id)) {
      result = await db.collection('products').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    } else {
      result = await db.collection('products').updateOne(
        { _id: id },
        { $set: updateData }
      );
    }
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    let result;
    // Try ObjectId first, then string ID
    if (ObjectId.isValid(id)) {
      result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    } else {
      result = await db.collection('products').deleteOne({ _id: id });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return getProduct(req, res);
  } else if (req.method === 'PUT') {
    return requireAuth(req, res, () => updateProduct(req, res));
  } else if (req.method === 'DELETE') {
    return requireAuth(req, res, () => deleteProduct(req, res));
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
