// Mock data for development
export const mockProducts = [
  {
    _id: '1',
    name: 'Nike Air Jordan 1 Retro High',
    priceEGP: 8500,
    description: 'Classic basketball shoe with premium leather construction',
    brand: 'Nike',
    sizes: ['40', '41', '42', '43', '44'],
    colors: ['Black', 'White', 'Red'],
    images: [],
    soldOut: false
  },
  {
    _id: '2',
    name: 'Adidas Yeezy Boost 350',
    priceEGP: 12000,
    description: 'Comfortable and stylish sneaker with boost technology',
    brand: 'Adidas',
    sizes: ['39', '40', '41', '42', '43'],
    colors: ['Black', 'White'],
    images: [],
    soldOut: false
  },
  {
    _id: '3',
    name: 'Off-White x Nike Air Force 1',
    priceEGP: 15000,
    description: 'Limited edition collaboration sneaker',
    brand: 'oof-white',
    sizes: ['40', '41', '42', '43'],
    colors: ['White', 'Black'],
    images: [],
    soldOut: false
  },
  {
    _id: '4',
    name: 'Balenciaga Triple S',
    priceEGP: 18000,
    description: 'Chunky luxury sneaker with distinctive design',
    brand: 'Blanciaga',
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['White', 'Black', 'Gray'],
    images: [],
    soldOut: false
  },
  {
    _id: '5',
    name: 'Louis Vuitton Trainer',
    priceEGP: 25000,
    description: 'Luxury sneaker with premium materials',
    brand: 'Louis vutiune',
    sizes: ['40', '41', '42', '43'],
    colors: ['White', 'Black', 'Brown'],
    images: [],
    soldOut: true
  },
  {
    _id: '6',
    name: 'Dior B23 High-Top',
    priceEGP: 22000,
    description: 'High-end fashion sneaker with oblique pattern',
    brand: 'Dior',
    sizes: ['39', '40', '41', '42', '43'],
    colors: ['White', 'Black'],
    images: [],
    soldOut: false
  }
];

export const mockOrders = [
  {
    _id: 'order1',
    items: [
      {
        productId: '1',
        name: 'Nike Air Jordan 1 Retro High',
        size: '42',
        color: 'Black',
        quantity: 1,
        price: 8500
      }
    ],
    customer: {
      name: 'Ahmed Mohamed',
      address: 'Cairo, Egypt',
      phone1: '01012345678',
      phone2: '01087654321'
    },
    shippingFee: 120,
    total: 8620,
    status: 'pending',
    createdAt: new Date('2024-01-15')
  }
];
