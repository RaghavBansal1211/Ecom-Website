import React, { useState } from 'react';
import AddProduct from './AddProduct';
import UpdateProduct from './UpdateProduct';
import UpdateOrder from './UpdateOrder';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  const renderView = () => {
    switch (activeView) {
      case 'add':
        return <AddProduct />;
      case 'update':
        return <UpdateProduct />;
      case 'status':
        return <UpdateOrder/>;
      default:
        return (
          <div className="text-gray-600 mt-8 text-xl font-medium text-center">
            Please select an action from the navigation bar.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={() => setActiveView('add')}
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            ➕ Add Product
          </button>
          <button
            onClick={() => setActiveView('update')}
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            ✏️ Update Product
          </button>
         
          <button
            onClick={() => setActiveView('status')}
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            🔄 Update Order Status
          </button>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:underline font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <div className="p-6">{renderView()}</div>
    </div>
  );
};

export default AdminDashboard;
