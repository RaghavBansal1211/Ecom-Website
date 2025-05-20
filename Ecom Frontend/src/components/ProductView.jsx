import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/products/${id}`);
        setProduct(res.data);
        setCurrentImgIndex(0); // reset slider index on product change
      } catch (err) {
        toast.error('Failed to load product');
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/products/review/${id}`);
        setReviews(res.data || []);
      } catch (err) {
        toast.error('Failed to load reviews');
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  const handleAddToCart = () => {
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

  const images = product?.imageUrl && Array.isArray(product.imageUrl)
    ? product.imageUrl
    : product?.imageUrl
    ? [product.imageUrl]
    : [];

  const prevImage = () => {
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index) => {
    setCurrentImgIndex(index);
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 md:px-16 lg:px-28 py-10 bg-gray-50">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-blue-600 hover:underline text-sm"
      >
        ← Back to Products
      </button>

      <div className="bg-white rounded shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div
          className="relative max-w-full"
          style={{ maxWidth: '500px' }}
        >
          {/* Image */}
          <img
            src={`http://localhost:8000${images[currentImgIndex]}`}
            alt={product.name}
            style={{
              width: '100%',
              height: '400px',
              objectFit: 'contain', // full image visible, no cropping
              display: 'block',
              margin: '0 auto',
            }}
          />

          {/* Prev Button */}

{images.length > 1 && (
  <>
    <button
      onClick={prevImage}
      style={{
        position: 'absolute',
        top: '50%',
        left: '8px',
        transform: 'translateY(-50%)',
        backgroundColor: 'white',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        fontWeight: 'bold',
        fontSize: '24px',
        border: '1px solid #ddd',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)',
        lineHeight: '1',
        paddingBottom: '2px',
        paddingRight: '1px'
      }}
      aria-label="Previous Image"
    >
      &lt;
    </button>
    <button
      onClick={nextImage}
      style={{
        position: 'absolute',
        top: '50%',
        right: '8px',
        transform: 'translateY(-50%)',
        backgroundColor: 'white',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        fontWeight: 'bold',
        fontSize: '24px',
        border: '1px solid #ddd',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)',
        lineHeight: '1',
        paddingBottom: '2px'
      }}
      aria-label="Next Image"
    >
      &gt;
    </button>
  </>
)}

          {/* Navigation Dots */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: currentImgIndex === index ? '#2563eb' : '#d1d5db',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

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
            onClick={handleAddToCart}
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
                  <span className="font-semibold">{review.userId?.name || 'Anonymous'}</span>
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
    </div>
  );
};

export default ProductView;
