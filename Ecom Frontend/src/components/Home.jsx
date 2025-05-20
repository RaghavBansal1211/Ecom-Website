import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === "CUSTOMER") setIsLoggedIn(true);

    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:8000/products/fetchAll');
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <div>
      <Toaster position="top-center" />

      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 shadow bg-white">
        <h1 className="text-2xl font-bold text-blue-600">ShopSmart</h1>
        <div className="space-x-4">
          {isLoggedIn ? (
            <>
              <Link to="/cart" className="text-blue-600 hover:underline">🛒 Cart</Link>
              <Link to="/orders" className="text-blue-600 hover:underline">Order Details</Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
              <Link to="/signup" className="text-blue-600 hover:underline">Signup</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gray-100 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to ShopSmart</h2>
        <p className="text-lg text-gray-600 mb-6">
          Discover amazing deals on electronics, fashion, home & more
        </p>
        <Link to="/products" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
          Shop Now
        </Link>
      </section>

      {/* Product Listing */}
      <section className="px-8 md:px-16 lg:px-28 py-12 bg-white">
        <h3 className="text-2xl font-semibold mb-8">Featured Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
          ) : (
            products.map(product => (
              <div key={product._id} className="border p-4 rounded shadow hover:shadow-md transition flex flex-col justify-between">
                <img
                  src={`http://localhost:8000${product.imageUrl[0]}`}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-4"
                />
                <h4 className="font-semibold text-lg mb-1">{product.name}</h4>
                <p className="text-gray-600 mb-1">{product.description}</p>
                <p className="text-blue-600 font-bold mb-4">₹{product.price}</p>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Link
                    to={`/product/${product._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow hover:bg-blue-700 transition text-center"
                  >
                    View Product
                  </Link>
                  <button
                    disabled={product.stock === 0}
                    onClick={() => handleAddToCart(product)}
                    className={`${
                      product.stock === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white px-4 py-2 rounded-full text-sm font-medium shadow transition text-center`}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
