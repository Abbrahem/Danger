const { MongoClient } = require('mongodb');

// Mock database for development when MongoDB is not available
class MockDatabase {
  constructor() {
    this.collections = {
      products: [
        {
          _id: 'mock_1',
          name: 'Nike Air Force 1',
          priceEGP: 2500,
          description: 'Classic white sneakers',
          brand: 'Nike',
          sizes: ['40', '41', '42', '43'],
          colors: ['White', 'Black'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_2',
          name: 'Adidas Superstar',
          priceEGP: 2200,
          description: 'Iconic three stripes design',
          brand: 'Adidas',
          sizes: ['39', '40', '41', '42'],
          colors: ['White', 'Black', 'Blue'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_3',
          name: 'Jordan Retro 1',
          priceEGP: 3500,
          description: 'Basketball legend sneakers',
          brand: 'Jordan',
          sizes: ['40', '41', '42', '43', '44'],
          colors: ['Red', 'Black', 'White'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      orders: [],
      users: [
        {
          _id: 'admin_1',
          email: 'admin@danger.com',
          password: '$2b$10$rQZ8kqX5Y9YvY8Y8Y8Y8YeY8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y8Y',
          role: 'admin',
          createdAt: new Date()
        }
      ],
      images: []
    };
    this.nextId = 4;
    this.imageStorage = new Map(); // Store image data
  }

  // Add method to store images
  storeImage(buffer, filename, contentType) {
    const imageId = `img_${this.nextId++}`;
    console.log('MockDB: Storing image with ID:', imageId, 'Size:', buffer.length);
    this.imageStorage.set(imageId, {
      buffer,
      filename,
      contentType,
      uploadDate: new Date()
    });
    console.log('MockDB: Total images stored:', this.imageStorage.size);
    return imageId;
  }

  // Add method to retrieve images
  getImage(imageId) {
    console.log('MockDB: Looking for image:', imageId);
    const image = this.imageStorage.get(imageId);
    console.log('MockDB: Found image:', image ? 'Yes' : 'No');
    if (image) {
      console.log('MockDB: Image details - Size:', image.buffer.length, 'Type:', image.contentType);
    }
    return image;
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = [];
    }
    
    return {
      find: (query = {}) => ({
        toArray: () => Promise.resolve(this.collections[name].filter(item => this.matchesQuery(item, query))),
        sort: (sortObj) => ({
          toArray: () => {
            const sorted = [...this.collections[name]].sort((a, b) => {
              const key = Object.keys(sortObj)[0];
              const order = sortObj[key];
              if (order === 1) return a[key] > b[key] ? 1 : -1;
              return a[key] < b[key] ? 1 : -1;
            });
            return Promise.resolve(sorted);
          }
        }),
        limit: (num) => ({
          toArray: () => Promise.resolve(this.collections[name].slice(0, num))
        })
      }),
      findOne: (query) => {
        const item = this.collections[name].find(item => this.matchesQuery(item, query));
        return Promise.resolve(item || null);
      },
      insertOne: (doc) => {
        const id = `mock_${this.nextId++}`;
        const newDoc = { ...doc, _id: id };
        this.collections[name].push(newDoc);
        return Promise.resolve({ insertedId: id });
      },
      updateOne: (query, update) => {
        const index = this.collections[name].findIndex(item => this.matchesQuery(item, query));
        if (index !== -1) {
          if (update.$set) {
            this.collections[name][index] = { ...this.collections[name][index], ...update.$set };
          }
          return Promise.resolve({ matchedCount: 1, modifiedCount: 1 });
        }
        return Promise.resolve({ matchedCount: 0, modifiedCount: 0 });
      },
      deleteOne: (query) => {
        const index = this.collections[name].findIndex(item => this.matchesQuery(item, query));
        if (index !== -1) {
          this.collections[name].splice(index, 1);
          return Promise.resolve({ deletedCount: 1 });
        }
        return Promise.resolve({ deletedCount: 0 });
      }
    };
  }

  matchesQuery(item, query) {
    if (Object.keys(query).length === 0) return true;
    
    for (const [key, value] of Object.entries(query)) {
      if (key === '_id') {
        if (item._id !== value && item._id !== value.toString()) return false;
      } else if (item[key] !== value) {
        return false;
      }
    }
    return true;
  }

  db(name) {
    return this;
  }
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority'
};

let client;
let clientPromise;
let useMockDB = false;

if (!process.env.MONGODB_URI) {
  console.log('No MongoDB URI found, using mock database');
  useMockDB = true;
}

if (useMockDB) {
  // Use mock database
  const mockClient = new MockDatabase();
  clientPromise = Promise.resolve(mockClient);
  console.log('Using Mock Database for development');
} else {
  console.log('Attempting MongoDB Atlas connection...');
  
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect()
        .then((client) => {
          console.log('MongoDB Atlas connected successfully');
          return client;
        })
        .catch((error) => {
          console.error('MongoDB Atlas connection failed, falling back to mock database:', error.message);
          const mockClient = new MockDatabase();
          return mockClient;
        });
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect()
      .then((client) => {
        console.log('MongoDB Atlas connected successfully');
        return client;
      })
      .catch((error) => {
        console.error('MongoDB Atlas connection failed, falling back to mock database:', error.message);
        const mockClient = new MockDatabase();
        return mockClient;
      });
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
module.exports = clientPromise;
