import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [userId, setUserId] = useState(null);
  const [reviewMap, setReviewMap] = useState({});
  const [openReviewFor, setOpenReviewFor] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    } catch {
      toast.error('Invalid token');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/customer/myorders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
        console.log(res);
        const hasCurrent = res.data.some(o => ['Pending', 'Shipped'].includes(o.orderStatus));
        const hasPast = res.data.some(o => o.orderStatus === 'Delivered');
        if (hasCurrent) setActiveTab('current');
        else if (hasPast) setActiveTab('past');
      } catch {
        toast.error('Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId || orders.length === 0) return;
      const token = localStorage.getItem('token');
      const map = {};
      for (const order of orders) {
        if (order.orderStatus === 'Delivered') {
          for (const item of order.items) {
            try {
              const res = await axios.get(`http://localhost:8000/products/review/${item._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const userReview = res.data.find(r => r.userId === userId);
              if (userReview) {
                map[item._id] = {
                  rating: userReview.rating,
                  comment: userReview.comment,
                };
              }
            } catch {}
          }
        }
      }
      setReviewMap(map);
    };
    fetchReviews();
  }, [orders, userId]);

  const currentOrders = orders.filter(o => ['Pending', 'Shipped'].includes(o.orderStatus));
  const pastOrders = orders.filter(o => o.orderStatus === 'Delivered');
  const ordersToShow = activeTab === 'current' ? currentOrders : pastOrders;

  const handleReviewSubmit = async (productId) => {
    try {
      await axios.post(
        `http://localhost:8000/customer/review/${productId}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Review submitted!');
      setReviewMap((prev) => ({
        ...prev,
        [productId]: { rating, comment },
      }));
      setOpenReviewFor(null);
      setRating(0);
      setComment('');
    } catch {
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading your orders...</div>;
  }

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

  return (
    <div className="min-h-screen p-6 bg-gray-50 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {/* Tabs */}
      <div className="flex space-x-6 mb-6 border-b">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-2 font-semibold ${
            activeTab === 'current' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
        >
          Current Orders
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-2 font-semibold ${
            activeTab === 'past' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
        >
          Past Orders
        </button>
      </div>

      {ordersToShow.length === 0 ? (
        <p className="text-gray-500">
          {activeTab === 'current' ? 'No current orders.' : 'No past orders.'}
        </p>
      ) : (
        <div className="space-y-8">
          {ordersToShow.map((order) => (
            <div key={order._id} className="bg-white rounded shadow p-6">
              <div className="flex justify-between mb-4">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`font-semibold ${
                    order.orderStatus === 'Delivered'
                      ? 'text-green-600'
                      : order.orderStatus === 'Shipped'
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                  }`}>
                    {order.orderStatus}
                  </span>
                </p>
              </div>

              <p className="mb-4"><strong>Shipping Address:</strong> {order.shippingAddress}</p>
              <p className="font-semibold mb-2">Items:</p>

              <ul className="list-disc list-inside space-y-4">
                {order.items.map((item) => (
                  <li key={item.name} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span>{item.name} — Qty: {item.quantity} — ₹{item.price} each</span>
                      {order.orderStatus === 'Delivered' && (
                        <button
                          onClick={() => {
                            setOpenReviewFor(item.productId);
                            setRating(reviewMap[item.productId]?.rating || 0);
                            setComment(reviewMap[item.productId]?.comment || '');
                          }}
                          className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          {reviewMap[item.productId] ? 'Edit Review' : 'Leave Review'}
                        </button>
                      )}
                    </div>

                    {openReviewFor === item.productId && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleReviewSubmit(item.productId);
                        }}
                        className="bg-gray-50 border rounded p-4 space-y-3"
                      >
                        {/* ⭐ Rating */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`text-2xl ${
                                (hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHover(star)}
                              onMouseLeave={() => setHover(0)}
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        <textarea
                          rows="3"
                          placeholder="Write your review..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                          className="w-full border p-2 rounded resize-none"
                        ></textarea>

                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setOpenReviewFor(null)}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                    )}
                  </li>
                ))}
              </ul>

              <p className="font-semibold text-lg mt-4">Total: ₹{order.totalAmount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
