import React, { useState } from 'react';

function PostManager() {
  const [posts, setPosts] = useState([
    { id: 1, title: "React là gì?", content: "React là thư viện JS..." },
  ]);
  const [form, setForm] = useState({ id: '', title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.title) return;
    if (isEditing) {
      setPosts(posts.map(p => p.id === form.id ? form : p));
      setIsEditing(false);
    } else {
      setPosts([...posts, { ...form, id: Date.now() }]);
    }
    setForm({ id: '', title: '', content: '' });
  };

  const handleDelete = (id) => setPosts(posts.filter(p => p.id !== id));
  
  const handleEdit = (post) => {
    setForm(post);
    setIsEditing(true);
  };

  return (
    <div>
      <h2>Quản lý Bài viết</h2>
      <div className="form-group">
        <input name="title" placeholder="Tiêu đề" value={form.title} onChange={handleChange} />
        <textarea name="content" placeholder="Nội dung" value={form.content} onChange={handleChange} rows="3"></textarea>
        <button onClick={handleSubmit}>{isEditing ? "Lưu" : "Đăng bài"}</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tiêu đề</th>
            <th>Nội dung (ngắn)</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>{post.title}</td>
              <td>{post.content.substring(0, 20)}...</td>
              <td>
                <button className="edit" onClick={() => handleEdit(post)}>Sửa</button>
                <button className="delete" onClick={() => handleDelete(post.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PostManager;