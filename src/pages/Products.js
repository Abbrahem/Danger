import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { mockProducts } from '../data/mockData';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const brands = [
    'Nike', 'Adidas', 'Blanciaga', 'Louis vutiune', 'oof-white', 
    'Lanvain', 'Jordan', 'Air', 'phalip phain', 'Alaxander MaQueen', 
    'BaBe', 'Dior', 'D&C', 'Vnas', 'Prada', 'more'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedBrand, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      console.log('Products from API:', response.data);
      console.log('Number of products:', response.data.length);
      if (response.data.length > 0) {
        console.log('First product structure:', response.data[0]);
        console.log('First product keys:', Object.keys(response.data[0]));
      }
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      console.log('Using mock data for development');
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    
    if (selectedBrand) {
      filtered = filtered.filter(product => 
        product.brand.toLowerCase().includes(selectedBrand.toLowerCase())
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleBrandFilter = (brand) => {
    setSelectedBrand(selectedBrand === brand ? '' : brand);
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Products</h1>

        {/* Filter and Search Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Brand Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-48 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span className="text-gray-700">
                {selectedBrand || 'All Brands'}
              </span>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-48 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedBrand('');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${!selectedBrand ? 'bg-gray-100 font-medium' : ''}`}
                >
                  All Brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleBrandFilter(brand)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedBrand === brand ? 'bg-gray-100 font-medium' : ''}`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">
              {selectedBrand ? `No products found for ${selectedBrand}` : 'No products available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              console.log('Rendering product:', product);
              return (
              <div key={product._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
                <div className="relative h-64 md:h-72 overflow-hidden">
                  <img
                    src={product.images?.[0] ? `/api/images/${product.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                    alt={product.name || 'Product'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onLoad={() => console.log('Products page image loaded:', product.images?.[0])}
                    onError={(e) => {
                      console.error('Products page image failed:', product.images?.[0]);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  {product.soldOut && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 text-sm font-bold rounded-full shadow-lg">
                      SOLD OUT
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-xl mb-2 text-gray-900 line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                      {product.brand}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {product.priceEGP} <span className="text-lg text-gray-600">EGP</span>
                    </p>
                  </div>
                  
                  
                  <Link
                    to={`/products/${product._id}`}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-center transition-all duration-200 block ${
                      product.soldOut 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                    onClick={(e) => product.soldOut && e.preventDefault()}
                  >
                    {product.soldOut ? 'Sold Out' : 'View Product'}
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
