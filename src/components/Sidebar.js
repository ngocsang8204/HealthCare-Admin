import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Chào mừng đến trang quản trị! 🚀</h2>
      <ul>
        {/* Link "/" bây giờ là Quản lý người dùng */}
        <li><Link to="/">👤 Quản lý Người dùng</Link></li>
        <li><Link to="/posts">📝 Quản lý Bài viết</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;