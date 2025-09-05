const bcrypt = require('bcryptjs');
const clientPromise = require('./mongodb');

const seedAdmin = async () => {
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Check if admin already exists
    const existingAdmin = await db.collection('admins').findOne({});
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      
      await db.collection('admins').insertOne({
        email: process.env.ADMIN_EMAIL || 'admin@danger.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      
      console.log('Admin user seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

module.exports = { seedAdmin };
