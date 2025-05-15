import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const STATUS_SEQUENCE = {
  Pending: 'Shipped',
  Shipped: 'Delivered',
  Delivered: null,
};

const OrderTabs = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/admin/orders/fetchAll', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const nextStatus = STATUS_SEQUENCE[currentStatus];
    if (!nextStatus) return;

    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/admin/orders/update/${orderId}`,
        { status: nextStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Order status updated to ${nextStatus}`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: nextStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading orders...</p>;

  // Filter orders by active tab
  const filteredOrders = orders.filter((o) => o.orderStatus === activeTab);

  const tabs = ['Pending', 'Shipped', 'Delivered'];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold rounded-t ${
              activeTab === tab
                ? 'bg-white border border-b-0 border-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <p className="text-gray-500">No {activeTab.toLowerCase()} orders.</p>
      ) : (
        filteredOrders.map((order) => {
          const nextStatus = STATUS_SEQUENCE[order.orderStatus];
          const isUpdating = updatingOrderId === order._id;

          return (
            <div key={order._id} className="bg-white rounded shadow p-6 mb-6">
              <div className="flex justify-between mb-4">
                <p>
                  <strong>Order ID:</strong> {order._id}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
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
                <p className="font-semibold mb-2">Items:</p>
                <ul className="list-disc list-inside space-y-1">
                  {order.items.map((item) => (
                    <li key={item.name}>
                      {item.name} — Qty: {item.quantity} — ₹{item.price} each
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mb-2">
                <strong>Shipping Address:</strong> {order.shippingAddress}
              </p>

              <p className="font-semibold text-lg mb-4">
                Total: ₹{order.totalAmount.toFixed(2)}
              </p>

              {nextStatus ? (
                <button
                  onClick={() => handleStatusUpdate(order._id, order.orderStatus)}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded text-white ${
                    isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } transition`}
                >
                  {isUpdating ? 'Updating...' : `Mark as ${nextStatus}`}
                </button>
              ) : (
                <p className="text-green-700 font-semibold">Order completed</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default OrderTabs;
