import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const shippingFee = 120;
  const subtotal = getCartTotal();
  const total = subtotal + (items.length > 0 ? shippingFee : 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
          <div className="py-16">
            <p className="text-xl text-gray-600 mb-8">Your cart is empty</p>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        <div className="space-y-6">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="card p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 h-32 flex-shrink-0">
                  <img
                    src={item.image ? `/api/images/${item.image}` : '/danger.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">Size: {item.size}</p>
                  <p className="text-gray-600">Color: {item.color}</p>
                  <p className="text-lg font-bold">{item.price} EGP</p>
                </div>

                <div className="flex flex-col items-end space-y-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                      className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                      className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.size, item.color)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>

                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {(item.price * item.quantity).toLocaleString()} EGP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-8 card p-6">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{subtotal.toLocaleString()} EGP</span>
            </div>
            
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{items.length > 0 ? `${shippingFee} EGP` : 'Free'}</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>{total.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Link to="/checkout" className="btn-primary w-full text-center block">
              Proceed to Checkout
            </Link>
            
            <Link to="/products" className="btn-secondary w-full text-center block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
