const { seedAdmin } = require('./lib/seedAdmin');
const clientPromise = require('./lib/mongodb');

const seedProducts = async () => {
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Check if products already exist
    const existingProducts = await db.collection('products').countDocuments();
    
    if (existingProducts === 0) {
      const sampleProducts = [
        {
          name: 'Nike Air Jordan 1 Retro High',
          priceEGP: 8500,
          description: 'Classic basketball shoe with premium leather construction',
          brand: 'Nike',
          sizes: ['40', '41', '42', '43', '44'],
          colors: ['Black', 'White', 'Red'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Adidas Yeezy Boost 350',
          priceEGP: 12000,
          description: 'Comfortable and stylish sneaker with boost technology',
          brand: 'Adidas',
          sizes: ['39', '40', '41', '42', '43'],
          colors: ['Black', 'White'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Off-White x Nike Air Force 1',
          priceEGP: 15000,
          description: 'Limited edition collaboration sneaker',
          brand: 'oof-white',
          sizes: ['40', '41', '42', '43'],
          colors: ['White', 'Black'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Balenciaga Triple S',
          priceEGP: 18000,
          description: 'Chunky luxury sneaker with distinctive design',
          brand: 'Blanciaga',
          sizes: ['39', '40', '41', '42', '43', '44'],
          colors: ['White', 'Black', 'Gray'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Louis Vuitton Trainer',
          priceEGP: 25000,
          description: 'Luxury sneaker with premium materials',
          brand: 'Louis vutiune',
          sizes: ['40', '41', '42', '43'],
          colors: ['White', 'Black', 'Brown'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Dior B23 High-Top',
          priceEGP: 22000,
          description: 'High-end fashion sneaker with oblique pattern',
          brand: 'Dior',
          sizes: ['39', '40', '41', '42', '43'],
          colors: ['White', 'Black'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await db.collection('products').insertMany(sampleProducts);
      console.log('Sample products seeded successfully');
      return { productsSeeded: sampleProducts.length };
    }
    
    return { productsSeeded: 0, message: 'Products already exist' };
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await seedAdmin();
    const productResult = await seedProducts();
    res.status(200).json({ 
      message: 'Seeding completed successfully',
      admin: 'Admin user seeded',
      products: productResult
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Failed to seed data', error: error.message });
  }
}
