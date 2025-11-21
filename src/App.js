import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UserManager from './components/UserManager';
import PostManager from './components/PostManager';
import Login from './Login';               // <--- Mới thêm
import AdminRoute from './components/AdminRoute'; // <--- Mới thêm
import './App.css';

// Tạo một Layout riêng cho Admin để chứa Sidebar và Content
// Mục đích: Để trang Login KHÔNG bị dính cái Sidebar này
const DashboardLayout = ({ children }) => {
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Route Login (Không bị bọc bởi AdminLayout -> Không có Sidebar) */}
        <Route path="/login" element={<Login />} />

        {/* 2. Route Trang chủ (UserManager) - ĐƯỢC BẢO VỆ */}
        <Route 
          path="/" 
          element={
            <AdminRoute>
              <DashboardLayout>
                <UserManager />
              </DashboardLayout>
            </AdminRoute>
          } 
        />
        
        {/* 3. Route Bài viết (PostManager) - ĐƯỢC BẢO VỆ */}
        <Route 
          path="/posts" 
          element={
            <AdminRoute>
              <DashboardLayout>
                <PostManager />
              </DashboardLayout>
            </AdminRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;