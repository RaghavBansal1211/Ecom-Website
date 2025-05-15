import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [hover, setHover] = useState(0);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      toast.error('Failed to load product');
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/products/review/${id}`);
      console.log(res);
      setReviews(res.data || []);
    } catch (err) {
      toast.error('Failed to load reviews');
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    register('rating', { required: 'Rating is required' }); // manual rating register
  }, [id, register]);

  const onSubmit = async (data) => {
    try {
      await axios.post(
        `http://localhost:8000/customer/review/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Review submitted ✅');
      reset();
      fetchReviews();
    } catch (err) {
      toast.error('Failed to submit review ❌');
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading product...</p>
      </div>
    );
  }

  const handleAddToCart = (product) => {
  if (!isLoggedIn) {
    toast.error('Please login to add items to your cart');
    return;
  }

  let existingCart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingProductIndex = existingCart.findIndex(item => item._id === product._id);

  if (existingProductIndex !== -1) {
    if (existingCart[existingProductIndex].quantity < product.stock) {
      existingCart[existingProductIndex].quantity += 1;
    } else {
      toast.error(`Only ${product.stock} in stock`);
      return;
    }
  } else {
    if (product.stock > 0) {
      existingCart.push({ ...product, quantity: 1 });
    } else {
      toast.error('Product out of stock');
      return;
    }
  }

  localStorage.setItem('cart', JSON.stringify(existingCart));
  toast.success(`${product.name} added to cart`);
};


  return (
    <div className="min-h-screen px-6 md:px-16 lg:px-28 py-10 bg-gray-50">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-blue-600 hover:underline text-sm"
      >
        ← Back to Products
      </button>

      <div className="bg-white rounded shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        <img
          src={`http://localhost:8000${product.imageUrl}`}
          alt={product.name}
          className="w-full h-[400px] object-cover rounded"
        />

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-gray-600 text-lg">{product.description}</p>
          <p className="text-2xl font-bold text-blue-700">₹{product.price}</p>

          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="text-gray-700 font-medium">
              {averageRating ? `${averageRating} / 5` : 'No rating yet'}
            </span>
            <span className="text-sm text-gray-500">
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>

          <button
            disabled={product.stock === 0}
            onClick={() => handleAddToCart(product)}
            className={`${
                product.stock === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white px-6 py-2 rounded transition`}
            >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 bg-white rounded shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Customer Reviews</h2>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <div key={i} className="border-b pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{review.userId.name || 'Anonymous'}</span>
                  <span className="text-yellow-500">⭐ {review.rating}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet for this product.</p>
        )}
      </div>

      {/* Add Review Form */}
      {/* Add Review Form */}
        {isLoggedIn && (
        <div className="mt-12 bg-white rounded shadow-md p-6 w-full max-w-3xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Leave a Review</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block mb-1 font-medium">Your Rating</label>
                <div className="flex gap-1 text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                    key={star}
                    className={`cursor-pointer transition ${
                        hover >= star || watch('rating') >= star
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    onClick={() => setValue('rating', star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    >
                    ★
                    </span>
                ))}
                </div>
                {errors.rating && <p className="text-red-500 text-sm">{errors.rating.message}</p>}
            </div>

            <div>
                <label className="block mb-1 font-medium">Comment</label>
                <textarea
                {...register('comment', { required: 'Comment is required' })}
                className="border p-2 w-full rounded resize-none"
                rows={4}
                />
                {errors.comment && <p className="text-red-500 text-sm">{errors.comment.message}</p>}
            </div>

            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
                Submit Review
            </button>
            </form>
        </div>
        )}

    </div>
  );
};

export default ProductView;
