// src/App.jsx

import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import UserView from './components/UserView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  const handleToggle = (e) => {
    if (e.target.checked) {
      // Navigate to admin login
      navigate('/admin');
    } else {
      // Navigate to user view
      navigate('/');
    }
  };

  return (
    <div className="app-container">
      <div className="header-bar">
        <h1>My Price Tracker</h1>
        <div className="role-toggle">
          <label htmlFor="role-switch">User</label>
          <input 
            type="checkbox" 
            id="role-switch"
            checked={isAdminRoute}
            onChange={handleToggle}
          />
          <label htmlFor="role-switch">Admin</label>
        </div>
      </div>

      {/* --- Routes will render the correct page below --- */}
      <Routes>
        <Route path="/" element={<UserView />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;