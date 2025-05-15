import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './ProtectedRoute'; 
import ProductView from './components/ProductView';
import Cart from './components/Cart';
import OrderDetails from './components/OrderDetails';



const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/product/:id" element={<ProductView />} />
      
      {/* Only the Admin Dashboard is a protected route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <OrderDetails />
          </ProtectedRoute>
        }
      />
    </Routes>


  );
};

export default App;
