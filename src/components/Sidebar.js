import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate

function Sidebar() {
  const navigate = useNavigate(); // 2. Khởi tạo hook chuyển trang

  // 3. Hàm xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      // Xóa sạch dữ liệu đăng nhập
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Chuyển hướng về trang login
      navigate('/login');
    }
  };

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h2>Admin Panel 🚀</h2>
        <ul>
          <li><Link to="/">👤 Quản lý Người dùng</Link></li>
          <li><Link to="/posts">📝 Quản lý Bài viết</Link></li>
        </ul>
      </div>

      {/* 4. Nút Đăng xuất nằm ở dưới cùng */}
      <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
        <button 
          onClick={handleLogout} 
          style={{
            width: '100%', 
            padding: '10px', 
            background: '#e74c3c', // Màu đỏ
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default Sidebar;