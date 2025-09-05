import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add-product');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    priceEGP: '',
    description: '',
    brand: '',
    sizes: [],
    colors: [],
    images: []
  });

  // Edit product state
  const [editingProduct, setEditingProduct] = useState(null);

  const brands = [
    'Nike', 'Adidas', 'Blanciaga', 'Louis vutiune', 'oof-white', 
    'Lanvain', 'Jordan', 'Air', 'phalip phain', 'Alaxander MaQueen', 
    'BaBe', 'Dior', 'D&C', 'Vnas', 'Prada', 'more'
  ];

  const availableSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  const availableColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Brown', 'Gray', 'Pink', 'Purple'];

  useEffect(() => {
    checkAuth();
    if (activeTab === 'manage-products') {
      fetchProducts();
    }
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      await axios.get('/api/auth/check', { withCredentials: true });
    } catch (error) {
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const response = await axios.get('/api/orders', { withCredentials: true });
      console.log('Orders response:', response.data);
      console.log('Orders length:', response.data.length);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productForm, { withCredentials: true });
        Swal.fire({ 
          icon: 'success', 
          title: 'Product Updated Successfully!', 
          text: 'The product has been updated.',
          showConfirmButton: true,
          confirmButtonText: 'View Product',
          showCancelButton: true,
          cancelButtonText: 'Continue Editing'
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(`/products/${editingProduct._id}`, '_blank');
          }
        });
        setEditingProduct(null);
      } else {
        const response = await axios.post('/api/products', productForm, { withCredentials: true });
        const productId = response.data.productId;
        
        Swal.fire({ 
          icon: 'success', 
          title: 'Product Added Successfully!', 
          html: `
            <p>Your product has been created with ID: <strong>${productId}</strong></p>
            <p>What would you like to do next?</p>
          `,
          showConfirmButton: true,
          confirmButtonText: 'View Product',
          showCancelButton: true,
          cancelButtonText: 'Add Another Product',
          showDenyButton: true,
          denyButtonText: 'Manage Products'
        }).then((result) => {
          if (result.isConfirmed) {
            // Open product in new tab
            window.open(`/products/${productId}`, '_blank');
          } else if (result.isDenied) {
            // Switch to manage products tab
            setActiveTab('manage-products');
          }
          // If cancelled, stay on add product form
        });
      }
      
      setProductForm({
        name: '', priceEGP: '', description: '', brand: '', sizes: [], colors: [], images: []
      });
      
      if (activeTab === 'manage-products') {
        fetchProducts();
      }
    } catch (error) {
      console.error('Product creation error:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: error.response?.data?.message || 'Failed to save product',
        footer: error.response?.data?.error ? `Details: ${error.response.data.error}` : ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      console.log('Uploading images...', files.length);
      const response = await axios.post('/api/upload', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Upload response:', response.data);
      
      if (response.data.imageIds && response.data.imageIds.length > 0) {
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, ...response.data.imageIds]
        }));
        
        Swal.fire({ 
          icon: 'success', 
          title: 'Images Uploaded', 
          text: `${response.data.imageIds.length} image(s) uploaded successfully`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Upload Failed', 
        text: error.response?.data?.message || 'Failed to upload images' 
      });
    }
  };

  const removeImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSizeToggle = (size) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorToggle = (color) => {
    setProductForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color) 
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      priceEGP: product.priceEGP,
      description: product.description,
      brand: product.brand,
      sizes: product.sizes,
      colors: product.colors,
      images: product.images
    });
    setEditingProduct(product);
    setActiveTab('add-product');
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/products/${productId}`, { withCredentials: true });
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
        fetchProducts();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete product' });
      }
    }
  };

  const handleSoldOutToggle = async (productId, currentStatus) => {
    try {
      console.log('Toggling soldOut for product:', productId, 'current status:', currentStatus);
      console.log('Sending request body:', { soldOut: !currentStatus });
      
      const response = await axios.patch(`/api/products/${productId}/soldout`, {
        soldOut: !currentStatus
      }, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('SoldOut toggle response:', response.data);
      fetchProducts(); // Refresh the products list
    } catch (error) {
      console.error('SoldOut toggle error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update product status' });
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', orderId, 'to:', newStatus);
      console.log('Sending request body:', { status: newStatus });
      
      const response = await axios.patch(`/api/orders/${orderId}`, 
        { status: newStatus }, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Order status update response:', response.data);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </header>

    {/* Navigation Tabs */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'add-product', label: 'Add New Product' },
            { id: 'manage-products', label: 'Manage Products' },
            { id: 'orders', label: 'Orders' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

        {/* Tab Content */}
        <div className="mt-8">
          {/* Add/Edit Product Tab */}
          {activeTab === 'add-product' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (EGP)</label>
                    <input
                      type="number"
                      value={productForm.priceEGP}
                      onChange={(e) => setProductForm({...productForm, priceEGP: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="input-field"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <select
                    value={productForm.brand}
                    onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`px-3 py-1 rounded border ${
                          productForm.sizes.includes(size)
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorToggle(color)}
                        className={`px-3 py-1 rounded border ${
                          productForm.colors.includes(color)
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="input-field"
                  />
                  
                  {productForm.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Uploaded Images ({productForm.images.length}):</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {productForm.images.map((imageId, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={`/api/images/${imageId}`}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                              onLoad={() => console.log('Image preview loaded:', imageId)}
                              onError={(e) => {
                                console.error('Image preview failed to load:', imageId);
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add New Product')}
                  </button>
                  
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: '', priceEGP: '', description: '', brand: '', sizes: [], colors: [], images: []
                        });
                      }}
                      className="btn-secondary"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Manage Products Tab */}
          {activeTab === 'manage-products' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Manage Products</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="card p-4">
                    <div className="relative h-48 mb-4">
                      <img
                        src={product.images?.[0] ? `/api/images/${product.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                        onLoad={() => console.log('Admin product image loaded:', product.images?.[0])}
                        onError={(e) => {
                          console.error('Admin product image failed:', product.images?.[0]);
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      {product.soldOut && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                          SOLD OUT
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2">{product.brand}</p>
                    <p className="font-bold mb-4">{product.priceEGP} EGP</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={product.soldOut}
                          onChange={() => handleSoldOutToggle(product._id, product.soldOut)}
                          className="rounded"
                        />
                        <label className="text-sm">Sold Out</label>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="btn-secondary text-xs px-3 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Orders ({orders.length})</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                    <div key={order._id} className="card p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Order #{order._id.slice(-6)}</h3>
                          <p><strong>Customer:</strong> {order.customer.name}</p>
                          <p><strong>Address:</strong> {order.customer.address}</p>
                          <p><strong>Phone 1:</strong> {order.customer.phone1}</p>
                          <p><strong>Phone 2:</strong> {order.customer.phone2}</p>
                          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Items:</h4>
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm mb-1">
                              {item.name} - Size: {item.size}, Color: {item.color}, Qty: {item.quantity}
                            </div>
                          ))}
                          <p className="font-bold mt-2">Total: {order.total} EGP (including {order.shippingFee} EGP shipping)</p>
                          
                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Status:</label>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                              className="input-field"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
