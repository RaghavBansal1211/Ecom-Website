import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current'); // default to current tab
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get('http://localhost:8000/customer/myorders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(res.data);

        // Determine which tab to show initially
        const hasCurrent = res.data.some(
          (order) => order.orderStatus === 'Pending' || order.orderStatus === 'Shipped'
        );
        const hasPast = res.data.some((order) => order.orderStatus === 'Delivered');

        if (hasCurrent) {
          setActiveTab('current');
        } else if (hasPast) {
          setActiveTab('past');
        } else {
          setActiveTab('current'); // default fallback
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading your orders...</p>
      </div>
    );
  }

  // Separate orders by status for tabs
  const currentOrders = orders.filter(
    (order) => order.orderStatus === 'Pending' || order.orderStatus === 'Shipped'
  );
  const pastOrders = orders.filter((order) => order.orderStatus === 'Delivered');

  // Choose orders to display based on active tab
  const ordersToShow = activeTab === 'current' ? currentOrders : pastOrders;

  // If no orders at all, show start shopping
  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6">
        <h2 className="text-2xl font-semibold mb-4">You have no orders yet.</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  // If active tab has no orders, show message for that tab only
  if (ordersToShow.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {/* Tabs */}
        <div className="flex space-x-6 mb-6 border-b">
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-2 font-semibold ${
              activeTab === 'current'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Current Orders
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-2 font-semibold ${
              activeTab === 'past'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Past Orders
          </button>
        </div>

        <p className="text-gray-500">
          {activeTab === 'current'
            ? 'No current orders.'
            : 'No past orders.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {/* Tabs */}
      <div className="flex space-x-6 mb-6 border-b">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-2 font-semibold ${
            activeTab === 'current'
              ? 'border-b-4 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Current Orders
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-2 font-semibold ${
            activeTab === 'past'
              ? 'border-b-4 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Past Orders
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-8">
        {ordersToShow.map((order) => (
          <div key={order._id} className="bg-white rounded shadow p-6">
            <div className="flex justify-between mb-4">
              <p>
                <span className="font-semibold">Order ID:</span> {order._id}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={
                    order.orderStatus === 'Delivered'
                      ? 'text-green-600 font-semibold'
                      : order.orderStatus === 'Shipped'
                      ? 'text-yellow-600 font-semibold'
                      : 'text-gray-600 font-semibold'
                  }
                >
                  {order.orderStatus}
                </span>
              </p>
            </div>

            <div className="mb-4">
              <p>
                <span className="font-semibold">Shipping Address:</span> {order.shippingAddress}
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold mb-2">Items:</p>
              <ul className="list-disc list-inside space-y-1">
                {order.items.map((item) => (
                  <li key={item.name}>
                    {item.name} — Qty: {item.quantity} — ₹{item.price} each
                  </li>
                ))}
              </ul>
            </div>

            <p className="font-semibold text-lg">Total: ₹{order.totalAmount.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetails;
