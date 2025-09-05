import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();

  const scrollToComplaints = () => {
    const complaintsSection = document.getElementById('complaints-section');
    if (complaintsSection) {
      complaintsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="/danger.jpg" 
                  alt="Danger Logo" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-2xl font-bold text-gray-900">Danger</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Products
              </Link>
              <button 
                onClick={scrollToComplaints}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Complaints
              </button>
              <Link to="/cart" className="relative">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between w-full">
            <Link to="/" className="flex items-center">
              <img 
                src="/danger.jpg" 
                alt="Danger Logo" 
                className="w-8 h-8 rounded-full object-cover"
              />
            </Link>
            
            <Link to="/" className="text-xl font-bold text-gray-900">
              Danger
            </Link>
            
            <Link to="/cart" className="relative">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
