import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UserManager from './components/UserManager';
import PostManager from './components/PostManager';
import './App.css';

function App() {
  return (
    <Router>
      <div className="admin-container">
        <Sidebar />
        
        <div className="content">
          <Routes>
            {/* Đặt UserManager làm trang chủ mặc định */}
            <Route path="/" element={<UserManager />} />
            
            {/* Route cho bài viết */}
            <Route path="/posts" element={<PostManager />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;