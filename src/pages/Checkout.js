import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Swal from 'sweetalert2';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone1: '',
    phone2: ''
  });

  const shippingFee = 120;
  const subtotal = getCartTotal();
  const total = subtotal + (items.length > 0 ? shippingFee : 0);

  const validateForm = () => {
    const { fullName, address, phone1, phone2 } = formData;
    
    if (!fullName.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your full name' });
      return false;
    }
    
    if (!address.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your address' });
      return false;
    }
    
    if (!phone1.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your first phone number' });
      return false;
    }
    
    if (!phone2.trim()) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter your second phone number' });
      return false;
    }
    
    if (phone1.length !== 11) {
      Swal.fire({ icon: 'error', title: 'Invalid Phone', text: 'Phone 1 must be exactly 11 digits' });
      return false;
    }
    
    if (phone2.length !== 11) {
      Swal.fire({ icon: 'error', title: 'Invalid Phone', text: 'Phone 2 must be exactly 11 digits' });
      return false;
    }
    
    if (phone1 === phone2) {
      Swal.fire({ icon: 'error', title: 'Invalid Phone', text: 'Phone numbers must be different' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      Swal.fire({ icon: 'error', title: 'Empty Cart', text: 'Your cart is empty' });
      return;
    }
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price
        })),
        customer: {
          name: formData.fullName,
          address: formData.address,
          phone1: formData.phone1,
          phone2: formData.phone2
        },
        shippingFee,
        total
      };

      const response = await axios.post('/api/orders', orderData);
      const orderId = response.data.orderId;
      
      clearCart();
      
      Swal.fire({
        icon: 'success',
        title: 'Order Placed Successfully!',
        html: `
          <p>Your order has been placed successfully!</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <br>
          <p><strong>Delivery Information:</strong></p>
          <p>• Cairo & Giza: 1 day</p>
          <p>• Other governorates: 3-5 days</p>
          <br>
          <p><strong>Return Policy:</strong> 3 days</p>
          <br>
          <p><em>Please save your Order ID for future reference</em></p>
        `,
        confirmButtonText: 'Continue Shopping'
      }).then(() => {
        navigate('/');
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: 'There was an error placing your order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For phone fields, only allow digits
    if (name === 'phone1' || name === 'phone2') {
      const digits = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digits }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <div className="py-16">
            <p className="text-xl text-gray-600 mb-8">Your cart is empty</p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{(item.price * item.quantity).toLocaleString()} EGP</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{subtotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shippingFee} EGP</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>{total.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>

          {/* Customer Information Form */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone 1 *</label>
                <input
                  type="tel"
                  name="phone1"
                  value={formData.phone1}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="01xxxxxxxxx (11 digits)"
                  maxLength="11"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone 2 *</label>
                <input
                  type="tel"
                  name="phone2"
                  value={formData.phone2}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="01xxxxxxxxx (11 digits)"
                  maxLength="11"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : 'Buy It'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
