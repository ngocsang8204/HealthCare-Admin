import React, { useState } from 'react';

function UserManager() {
  // 1. Mock Data (Dữ liệu giả)
  const [users, setUsers] = useState([
    { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com" },
    { id: 2, name: "Trần Thị B", email: "b@gmail.com" }
  ]);

  const [form, setForm] = useState({ id: '', name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Xử lý input thay đổi
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Thêm hoặc Cập nhật User
  const handleSubmit = () => {
    if (!form.name || !form.email) return alert("Vui lòng điền đủ thông tin");

    if (isEditing) {
      // Cập nhật
      setUsers(users.map(u => u.id === form.id ? form : u));
      setIsEditing(false);
    } else {
      // Thêm mới (Tạo ID ngẫu nhiên đơn giản)
      const newUser = { ...form, id: Date.now() };
      setUsers([...users, newUser]);
    }
    setForm({ id: '', name: '', email: '' }); // Reset form
  };

  // Xóa User
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  // Đổ dữ liệu lên form để sửa
  const handleEdit = (user) => {
    setForm(user);
    setIsEditing(true);
  };

  return (
    <div>
      <h2>Quản lý Người dùng</h2>
      
      {/* Form Thêm/Sửa */}
      <div className="form-group">
        <input 
          name="name" 
          placeholder="Họ tên" 
          value={form.name} 
          onChange={handleChange} 
        />
        <input 
          name="email" 
          placeholder="Email" 
          value={form.email} 
          onChange={handleChange} 
        />
        <button onClick={handleSubmit}>
          {isEditing ? "Cập nhật User" : "Thêm User mới"}
        </button>
      </div>

      {/* Danh sách User */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <button className="edit" onClick={() => handleEdit(user)}>Sửa</button>
                <button className="delete" onClick={() => handleDelete(user.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManager;