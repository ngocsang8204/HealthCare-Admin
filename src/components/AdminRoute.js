import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  let user = null;
  if (userStr) {
    try {
        user = JSON.parse(userStr);
    } catch (e) {
        user = null;
    }
  }

  // --- DEBUG LOG (Xem Console để biết tại sao bị đá về) ---
  console.log("🛡️ ADMIN ROUTE CHECK:");
  console.log("   -> Token:", !!token);
  console.log("   -> User Object:", user);
  console.log("   -> User Role:", user?.role);
  // -------------------------------------------------------

  if (!token) {
    console.log("⛔ Bị chặn: Không có token");
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra kỹ xem role có đúng là 'admin' không
  if (user && user.role !== 'admin') {
    console.log(`⛔ Bị chặn: Role là '${user.role}' chứ không phải 'admin'`);
    // alert("Tài khoản này không có quyền Admin!"); // Tạm tắt alert để đỡ phiền
    localStorage.clear(); 
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;