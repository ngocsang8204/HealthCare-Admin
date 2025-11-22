import React, { useState } from 'react';
import instance from './utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

// Sử dụng `instance` với `baseURL` được cấu hình trong `src/utils/axiosInstance`

function Login() {
  const [username, setUsername] = useState(''); // Backend bạn gọi là identifier (email hoặc username)
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       // Gửi username và password lên Backend
//       // (NestJS LocalStrategy mặc định nhận 'username' và 'password' trong body)
//       const response = await axios.post(API_URL, {
//         username: username, 
//         password: password
//       });

//       const data = response.data;

//       // --- KIỂM TRA QUYỀN ADMIN ---
//       // Dựa vào AuthService của bạn trả về: data.user.role
//       if (data.user.role !== 'admin') {
//         setError('Bạn không có quyền truy cập trang Quản trị!');
//         setLoading(false);
//         return;
//       }

//       // --- LƯU THÔNG TIN ---
//       localStorage.setItem('token', data.access_token);
//       localStorage.setItem('user', JSON.stringify(data.user));

//       // Chuyển hướng vào trong
//       alert(`Xin chào Admin ${data.user.name || username}!`);
//       navigate('/'); 

//     } catch (err) {
//       console.error(err);
//       if (err.response && err.response.status === 401) {
//         setError('Sai tên đăng nhập hoặc mật khẩu');
//       } else {
//         setError('Lỗi kết nối Server hoặc lỗi hệ thống');
//       }
//       setLoading(false);
//     }
//   };

const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // [DEBUG 1] Xem dữ liệu trước khi gửi
    console.log("🚀 FE: Bắt đầu gửi login...");
    console.log("📦 FE Payload:", { username, password });

    try {
      const response = await instance.post('/auth/login', {
        identifier: username,
        password: password,
      });

      // [DEBUG 2] Xem dữ liệu Server trả về nếu thành công
      console.log("✅ FE: Server phản hồi OK:", response.data);

      const data = response.data;

      if (data.user.role !== 'admin') {
        console.error("❌ FE: Sai quyền Admin. Role thực tế là:", data.user.role);
        setError('Bạn không có quyền truy cập!');
        setLoading(false);
        return;
      }

      const token = data.access_token || data.accessToken;

      if (!token) {
        console.error('❌ Lỗi: Backend không trả về token!');
        setError('Lỗi hệ thống: Không nhận được token');
        setLoading(false);
        return;
      }

      // 2. Lưu Token
      console.log('💾 Đang lưu token:', token);
      localStorage.setItem('token', token);
      // Cập nhật header mặc định cho instance
      try {
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (e) {
        console.warn('Could not set Authorization header on instance', e)
      }
      
      // 3. Lưu User
      localStorage.setItem('user', JSON.stringify(data.user));
      alert('Đăng nhập thành công!');
      window.location.href = '/';

    } catch (err) {
      // [DEBUG 3] Xem lỗi chi tiết Server trả về
      console.error("❌ FE: Lỗi xảy ra:", err);
      
      if (err.response) {
        console.log("📄 Status Code:", err.response.status);
        console.log("📄 Data lỗi từ Backend:", err.response.data);
      } else if (err.request) {
        console.log("⚠️ Không nhận được phản hồi từ Server (Check lại Port/IP)");
      } else {
        console.log("⚠️ Lỗi setup request:", err.message);
      }
      
      setError('Đăng nhập thất bại');
      setLoading(false);
    }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{margin: 0, color: '#2c3e50'}}>Admin Portal 🛡️</h2>
          <p style={{margin: '5px 0 0', color: '#7f8c8d', fontSize: '14px'}}>Đăng nhập để quản lý hệ thống</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username / Email</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="admin"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

// CSS Styles (Inline cho gọn)
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    background: '#ffffff',
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#34495e',
    fontWeight: '600',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border 0.3s',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background 0.3s',
  },
  errorAlert: {
    background: '#fee2e2',
    color: '#ef4444',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #fecaca'
  }
};

export default Login;