import React, { useState, useEffect } from 'react';
import instance from '../utils/axiosInstance';

// API path (instance already has baseURL)
const API_PATH = '/user';

function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State form
  const [form, setForm] = useState({ 
    id: '', 
    username: '', 
    email: '', 
    password: '',
    facebook_id: '',
    gender: 'true', 
    birthday: '',
    role: 'user', // Mặc định là User thường
    // type: 'local' // Sẽ được xử lý ngầm, không cần đưa vào state hiển thị
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  // --- 1. LẤY DANH SÁCH USER ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await instance.get(API_PATH);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setUsers(data);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      alert("Không thể kết nối đến Backend!");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // --- 2. XỬ LÝ INPUT FORM ---
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };
  
  // --- 3. THÊM HOẶC SỬA ---
  const handleSubmit = async () => {
    // Validate cơ bản
    if (!form.username || !form.email) return alert("Vui lòng điền username và email");
    if (!isEditing && (!form.password || form.password.length < 8)) {
      return alert("Mật khẩu phải từ 8 ký tự trở lên");
    }
    
    try {
      // Chuẩn bị dữ liệu gửi lên (Payload)
      const payload = {
        username: form.username,
        email: form.email,
        role: form.role, // <--- Gửi Role (admin/user)
        type: 'local',   // <--- Luôn mặc định là 'local' như yêu cầu
        facebook_id: form.facebook_id || undefined,
        gender: form.gender === 'true' || form.gender === true,
        otpCode: "",
      };
      
      // Xử lý ngày sinh
      if (form.birthday) {
        payload.birthday = new Date(form.birthday).toISOString();
      }
      
      // Xử lý mật khẩu
      if (form.password) {
        payload.password = form.password;
      }
      
            if (isEditing) {
        // PREVENT sending when id undefined or invalid
        if (!form.id || form.id === 'undefined') {
          console.error('Attempt to PATCH with invalid id:', form.id, form);
          alert("Lỗi: ID người dùng không hợp lệ. Vui lòng nhấn 'Edit' trên 1 user trước khi lưu.");
          return;
        }
        console.log('Updating user id=', form.id, 'payload=', payload);
        await instance.patch(`${API_PATH}/${form.id}`, payload);
        alert("Cập nhật thành công!");
      } else {
        await instance.post(API_PATH, payload);
        alert("Thêm mới thành công!");
      }
      
      fetchUsers(); 
      resetForm();
    } catch (error) {
      console.error("Lỗi Submit:", error);
      const msg = error.response?.data?.message 
      ? (Array.isArray(error.response.data.message) ? error.response.data.message.join(', ') : error.response.data.message)
      : error.message;
      alert("Lỗi: " + msg);
    }
  };
  
  // --- 4. XÓA USER ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa user này?")) {
      try {
        await instance.delete(`${API_PATH}/${id}`);
        setUsers(users.filter(user => (user._id || user.id) !== id));
      } catch (error) {
        console.error('Xóa thất bại:', error);
        alert("Xóa thất bại!");
        fetchUsers();
      }
    }
  };
  
  // --- 5. EDIT & RESET ---
  const handleEdit = (user) => {
    // Normalize id: user._id may be string or object like { $oid: "..." }
    let uid = user._id ?? user.id;
    if (uid && typeof uid === 'object') {
      uid = uid.$oid || uid.toString();
    }
    
    if (!uid) {
      console.warn('handleEdit: missing id for user', user);
      alert('Không thể chỉnh sửa user này: thiếu id từ server. Kiểm tra console.');
      return;
    }
    
    setForm({
      id: uid,
      username: user.username || '',
      email: user.email || '',
      password: '', 
      facebook_id: user.facebook_id || '',
      gender: user.gender ? 'true' : 'false',
      birthday: user.birthday ? user.birthday.split('T')[0] : '',
      role: user.role || 'user'
    });
    setIsEditing(true);
  };
  
  const resetForm = () => {
    setForm({ 
      id: '', username: '', email: '', password: '', 
      facebook_id: '', gender: 'true', birthday: '', 
      role: 'user' // Reset về mặc định
    });
    setIsEditing(false);
  };
  
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString('vi-VN');
  };
  
  return (
    <div>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
    <h2>Quản lý Người dùng {loading && <span style={{fontSize: '0.6em', color: '#888'}}>(Đang tải...)</span>}</h2>
    <button onClick={fetchUsers} style={{background: '#2ecc71'}}>🔄 Refresh</button>
    </div>
    
    {/* Form Input */}
    <div className="form-group">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
    
    <div>
    <label style={{fontSize: '12px'}}>Username *</label>
    <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
    </div>
    
    <div>
    <label style={{fontSize: '12px'}}>Email *</label>
    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
    </div>
    
    <div>
    <label style={{fontSize: '12px'}}>Mật khẩu {isEditing ? "(Để trống nếu ko đổi)" : "*"}</label>
    <input name="password" type="password" placeholder="Min 8 ký tự" value={form.password} onChange={handleChange} />
    </div>
    
    {/* --- DROPDOWN CHỌN ROLE (QUYỀN) --- */}
    <div style={{display: 'flex', flexDirection: 'column'}}>
    <label style={{fontSize: '12px', marginBottom: '4px', fontWeight: 'bold', color: '#d35400'}}>Vai trò (Role)</label>
    <select name="role" value={form.role} onChange={handleChange} style={{border: '1px solid #e67e22'}}>
    <option value="user">Người dùng (User)</option>
    <option value="admin">Quản trị viên (Admin)</option>
    </select>
    </div>
    {/* ---------------------------------- */}
    
    <div>
    <label style={{fontSize: '12px'}}>Facebook ID</label>
    <input name="facebook_id" placeholder="Facebook ID" value={form.facebook_id} onChange={handleChange} />
    </div>
    
    <div style={{display: 'flex', flexDirection: 'column'}}>
    <label style={{fontSize: '12px', marginBottom: '4px'}}>Ngày sinh</label>
    <input type="date" name="birthday" value={form.birthday} onChange={handleChange} />
    </div>
    
    <div style={{display: 'flex', flexDirection: 'column'}}>
    <label style={{fontSize: '12px', marginBottom: '4px'}}>Giới tính</label>
    <select name="gender" value={form.gender} onChange={handleChange}>
    <option value="true">Nam</option>
    <option value="false">Nữ</option>
    </select>
    </div>
    </div>
    
    <div style={{ marginTop: '15px' }}>
    <button
    onClick={handleSubmit}
    disabled={isEditing && (!form.id || form.id === 'undefined')}
    title={isEditing && (!form.id || form.id === 'undefined') ? "ID người dùng không hợp lệ" : undefined}
    >
    {isEditing ? "💾 Lưu thay đổi" : "➕ Thêm mới"}
    </button>
    {isEditing && <button onClick={resetForm} style={{backgroundColor: '#95a5a6'}}>Hủy bỏ</button>}
    </div>
    </div>
    
    {/* Table Display */}
    <div style={{ overflowX: 'auto' }}>
    <table style={{width: '100%', borderCollapse: 'collapse'}}>
    <thead>
    <tr style={{background: '#ecf0f1'}}>
    <th>Username</th>
    <th>Email</th>
    <th>Role</th> {/* Cột Role thay vì Type */}
    <th>Giới tính</th>
    <th>Ngày sinh</th>
    <th>Action</th>
    </tr>
    </thead>
    <tbody>
    {users.map(user => {
      const uid = user._id || user.id;
      return (
        <tr key={uid}>
        <td>{user.username}</td>
        <td>{user.email}</td>
        
        {/* Hiển thị Role */}
        <td>
        <span style={{
          padding: '4px 8px', 
          borderRadius: '4px', 
          // Admin màu đỏ, User màu xanh
          background: user.role === 'admin' ? '#c0392b' : '#2980b9', 
          color: 'white', 
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
        {user.role ? user.role.toUpperCase() : 'USER'}
        </span>
        </td>
        
        <td>{user.gender ? "Nam" : "Nữ"}</td>
        <td>{formatDate(user.birthday)}</td>
        <td style={{ width: '120px' }}>
        <button className="edit" onClick={() => handleEdit(user)}>✏️</button>
        <button className="delete" onClick={() => handleDelete(uid)}>🗑️</button>
        </td>
        </tr>
      );
    })}
    </tbody>
    </table>
    </div>
    </div>
  );
}

export default UserManager;