import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { mockProducts } from '../data/mockData';

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [complaintForm, setComplaintForm] = useState({
    name: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    fetchLatestProducts();
  }, []);

  const fetchLatestProducts = async () => {
    try {
      // Try to fetch from API first, fallback to mock data
      const response = await axios.get('/api/products?limit=6');
      setLatestProducts(response.data);
    } catch (error) {
      console.log('Using mock data for development');
      // Use mock data for development
      setLatestProducts(mockProducts.slice(0, 6));
    }
  };

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    
    if (!complaintForm.name || !complaintForm.phone || !complaintForm.message) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all fields'
      });
      return;
    }

    const message = `Hello, I'm ${complaintForm.name}. Phone: ${complaintForm.phone}. Message: ${complaintForm.message}`;
    const whatsappUrl = `https://wa.me/201014011855?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    setComplaintForm({ name: '', phone: '', message: '' });
    Swal.fire({
      icon: 'success',
      title: 'Redirecting to WhatsApp',
      text: 'Your complaint will be sent via WhatsApp'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/c1.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative text-center text-white px-4 z-10 mt-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">Premium Sneakers</h1>
          <p className="text-lg md:text-xl mb-12 drop-shadow-md">Discover the latest collection of authentic sneakers</p>
          <Link to="/products" className="btn-primary inline-block">
            Shop New
          </Link>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Latest Products</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {latestProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
              <div className="relative h-48 md:h-56 overflow-hidden">
                <img
                  src={product.images?.[0] ? `/api/images/${product.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onLoad={() => console.log('Home page image loaded:', product.images?.[0])}
                  onError={(e) => {
                    console.error('Home page image failed:', product.images?.[0]);
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
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-lg mb-1 text-gray-900 line-clamp-2 leading-tight">{product.name}</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{product.brand}</p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xl font-bold text-gray-900">{product.priceEGP} <span className="text-sm text-gray-600">EGP</span></p>
                </div>
                <Link
                  to={`/products/${product._id}`}
                  className={`w-full py-2.5 px-3 rounded-lg font-semibold text-center transition-all duration-200 block text-sm ${
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
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products" className="btn-secondary">
            View More
          </Link>
        </div>
      </section>

      {/* Complaint Form */}
      <section id="complaints-section" className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Send a Complaint</h2>
          
          <form onSubmit={handleComplaintSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={complaintForm.name}
                onChange={(e) => setComplaintForm({...complaintForm, name: e.target.value})}
                className="input-field"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={complaintForm.phone}
                onChange={(e) => setComplaintForm({...complaintForm, phone: e.target.value})}
                className="input-field"
                placeholder="Your phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={complaintForm.message}
                onChange={(e) => setComplaintForm({...complaintForm, message: e.target.value})}
                className="input-field"
                rows="4"
                placeholder="Describe your complaint"
              ></textarea>
            </div>
            
            <button type="submit" className="btn-primary w-full">
              Send Complaint
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <a
              href="https://instagram.com/danger_sneakers"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://wa.me/201014011855"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </a>
          </div>
          <p className="text-gray-400">© 2024 Danger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
