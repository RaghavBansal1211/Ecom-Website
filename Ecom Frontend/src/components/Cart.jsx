import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [paymentMode] = useState('Cash'); // fixed for now
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const incrementQuantity = (productId) => {
    let stockLimitReached = false;

    const newCart = cart.map((item) => {
      if (item._id === productId) {
        if (item.quantity < item.stock) {
          return { ...item, quantity: item.quantity + 1 };
        } else {
          stockLimitReached = true;
        }
      }
      return item;
    });

    if (stockLimitReached) {
      toast.error('You have reached the maximum available stock for this item.');
    }

    updateCart(newCart);
  };

  const decrementQuantity = (productId) => {
    const newCart = cart
      .map((item) =>
        item._id === productId ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    updateCart(newCart);
  };

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleOrderPlacement = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter a shipping address.');
      return;
    }

    const orderPayload = {
      items: cart.map(({_id, name, quantity, price }) => ({
        productId:_id,
        name,
        quantity,
        price,
      })),
      shippingAddress: address,
    };

    try {
      const token = localStorage.getItem('token');
      console.log(orderPayload);
      const res = await axios.post(
        'http://localhost:8000/customer/placeOrder',
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message || 'Order placed successfully!');
      localStorage.removeItem('cart');
      setCart([]);
      setAddress('');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Failed to place order. Please try again.'
      );
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6">
        <h2 className="text-3xl font-semibold mb-4">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      {/* Left: Cart Details */}
      <div className="md:w-2/3 bg-white rounded shadow p-6 space-y-6">
        <h2 className="text-3xl font-semibold mb-6">Your Shopping Cart</h2>
        {cart.map((item) => (
          <div
            key={item._id}
            className="flex items-center border-b pb-4 last:border-b-0"
          >
            <img
              src={`http://localhost:8000${item.imageUrl}`}
              alt={item.name}
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex-1 ml-6">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-gray-600">Price: ₹{item.price}</p>
              <p className="text-gray-700">Quantity: {item.quantity}</p>
              <p className="text-sm text-gray-500">
                Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => incrementQuantity(item._id)}
                className={`px-3 py-1 rounded text-white transition relative group ${
                  item.quantity >= item.stock
                    ? 'bg-gray-400 hover:cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                ▲
                {item.quantity >= item.stock && (
                  <span className="absolute bottom-full mb-1 hidden group-hover:block text-xs bg-black text-white px-2 py-1 rounded shadow z-10">
                    Stock limit reached
                  </span>
                )}
              </button>

              <button
                onClick={() => decrementQuantity(item._id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              >
                ▼
              </button>
            </div>
          </div>
        ))}

        <div className="text-right mt-6">
          <p className="text-xl font-semibold">
            Total: ₹{getTotalPrice().toFixed(2)}
          </p>
        </div>
      </div>

      {/* Right: Shipping & Payment */}
      <div className="md:w-1/3 bg-white rounded shadow p-6 flex flex-col">
        <h2 className="text-2xl font-semibold mb-6">Shipping & Payment</h2>

        <label className="block mb-2 font-medium" htmlFor="address">
          Shipping Address
        </label>
        <textarea
          id="address"
          rows={5}
          className="border rounded p-2 mb-4 resize-none"
          placeholder="Enter your shipping address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <label className="block mb-2 font-medium">Payment Mode</label>
        <input
          type="text"
          readOnly
          value={paymentMode}
          className="border rounded p-2 mb-6 bg-gray-100 cursor-not-allowed"
        />

        <button
          onClick={handleOrderPlacement}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Place Order
        </button>

        <button
        onClick={() => navigate('/')}
        className="mt-4 bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition"
        >
        Shop More
        </button>
      </div>
    </div>
  );
};

export default Cart;
