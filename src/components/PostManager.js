import React, { useState, useEffect } from 'react';
import instance from '../utils/axiosInstance';

const API_PATH = '/posts';

// CẤU HÌNH CLOUDINARY
const CLOUD_NAME = 'dthx1zz57'; 
const UPLOAD_PRESET = 'blog_upload_demo'; 

function PostManager() {
  const [posts, setPosts] = useState([]);
    const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [form, setForm] = useState({ 
    id: '', // Quan trọng: dùng để lưu _id khi sửa
    title: '', 
    excerpt: '', 
    content: '', 
    image: '', 
    date: '',
    type: '' 
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Helper: sort posts by date (newest first). Falls back to 0 for invalid dates.
  function sortPosts(arr) {
    if (!Array.isArray(arr)) return [];
    const toTime = (p) => {
      const d = p && (p.date || p.createdAt) ? (p.date || p.createdAt) : '';
      const t = Date.parse(d);
      return isNaN(t) ? 0 : t;
    };
    return arr.slice().sort((a, b) => toTime(b) - toTime(a));
  }

  // LOAD DATA
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await instance.get(API_PATH);
        const data = res.data;
          if (mounted) {
              if (Array.isArray(data)) setPosts(sortPosts(data));
              else if (data.data && Array.isArray(data.data)) setPosts(sortPosts(data.data));
              else setPosts([]);
          }
      } catch (err) {
        console.error('Failed to load posts', err);
        if (mounted) setPosts([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
        setForm(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  // Available post types
  const POST_TYPES = [
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'sport', label: 'Sport' },
    { value: 'work_out', label: 'Work Out' }
  ];

  // UPLOAD CLOUDINARY
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.error) {
            alert("Lỗi Cloudinary: " + data.error.message);
            return null;
        }
        return data.secure_url; 
    } catch (error) {
        alert("Lỗi mạng khi upload ảnh: " + error.message);
        return null;
    }
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Chặn reload form
    
    if (!form.title) return alert("Tiêu đề không được để trống!");

    // Kiểm tra ID nếu đang sửa (Tránh lỗi undefined)
    if (isEditing && !form.id) {
        return alert("Lỗi: Không tìm thấy ID bài viết để sửa. Hãy thử tải lại trang.");
    }

    setIsUploading(true);

    let imageUrl = form.image; 

    // Logic upload ảnh
    if (selectedFile) {
        const uploadedUrl = await uploadToCloudinary(selectedFile);
        if (uploadedUrl) {
            imageUrl = uploadedUrl;
        } else {
            setIsUploading(false);
            return; // Dừng nếu upload lỗi
        }
    } else if (form.image && form.image.startsWith('blob:')) {
         // Nếu là blob mà mất file gốc thì reset để tránh gửi blob lên server
         imageUrl = ""; 
    }

    const payload = {
        title: form.title,
        excerpt: form.excerpt || form.content.substring(0, 100),
        content: form.content,
        image: imageUrl,
      date: form.date || new Date().toISOString(),
      type: form.type || ''
    };
    

    try {
      // SỬA LỖI PUT UNDEFINED: Dùng form.id đã được set trong handleEdit
      let res;
      if (isEditing) {
        res = await instance.put(`${API_PATH}/${form.id}`, payload);
      } else {
        res = await instance.post(API_PATH, payload);
      }

      const data = res.data;

      if (isEditing) {
        // Cập nhật lại list (so sánh theo _id hoặc id)
        setPosts(prev => sortPosts(prev.map(p => (p._id === data._id || p.id === data.id) ? data : p)));
        setIsEditing(false);
      } else {
        setPosts(prev => sortPosts([...prev, data]));
      }
      
      // Reset form hoàn toàn
      setForm({ id: '', title: '', excerpt: '', content: '', image: '', date: '', type: '' });
      setSelectedFile(null);
      document.getElementById('fileInput').value = "";
      alert("Thành công!");

    } catch (err) {
      console.error(err);
      alert("Thất bại: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // XÓA BÀI VIẾT (Dùng _id)
  // const handleDelete = async (id) => {
  //   if(!window.confirm("Bạn có chắc muốn xóa?")) return;
    
  //   try {
  //     console.log("Deleting post with ID:", id);
  //     await instance.delete(`${API_PATH}/${id}`);
  //     setPosts(prev => prev.filter(p => p._id !== id)); // Lọc theo _id
  //   } catch (err) {
  //     console.error('Failed to delete post', err);
  //   }
  // }
  // ...existing code...
  // XÓA BÀI VIẾT (Dùng _id hoặc id)
  const handleDelete = async (id, postObj) => {
    
    if(!id) {
      console.error("Delete called with undefined id");
      return alert("Không tìm thấy ID bài viết.");
    }
    if(!window.confirm("Bạn có chắc muốn xóa?")) return;
    
    try {
      const res = await instance.delete(`${API_PATH}/${id}`);
      // Loại cả trường hợp _id hoặc id, rồi sắp xếp lại
      setPosts(prev => sortPosts(prev.filter(p => (p._id || p.id) !== id)));
    } catch (err) {
      console.error('Failed to delete post', err);
      alert("Xóa thất bại: " + (err.response?.data?.message || err.message));
    }
  }
// ...existing code...

  // CHUẨN BỊ SỬA (QUAN TRỌNG NHẤT)
  const handleEdit = (post) => {
    
    setForm({ 
        // Ưu tiên lấy _id của MongoDB, phòng hờ thì lấy id
        id: post._id || post.id, 
        title: post.title, 
        excerpt: post.excerpt || '',
        content: post.content,
        image: post.image || '', 
        date: post.date,
        type: post.type || ''
    });
    setSelectedFile(null);
    setIsEditing(true);
  };

  // Filter posts by type and search query (title, excerpt, content)
  const queryLower = (query || '').toLowerCase().trim();
  const filteredByType = filterType && filterType !== 'all'
    ? posts.filter(p => (p.type || '') === filterType)
    : posts;

  const filteredPosts = queryLower
    ? filteredByType.filter(p => (
        (p.title || '').toLowerCase().includes(queryLower) ||
        (p.excerpt || '').toLowerCase().includes(queryLower) ||
        (p.content || '').toLowerCase().includes(queryLower)
      ))
    : filteredByType;

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý Bài viết {isUploading && "(Đang xử lý...)"}</h2>
      
      <div className="form-group" style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 500 }}>
        <input name="title" placeholder="Tiêu đề" value={form.title} onChange={handleChange} style={{ padding: 8 }}/>
        <input name="excerpt" placeholder="Mô tả ngắn" value={form.excerpt} onChange={handleChange} style={{ padding: 8 }}/>
        <textarea name="content" placeholder="Nội dung" value={form.content} onChange={handleChange} rows="4" style={{ padding: 8 }}></textarea>

        <div>
            <label>Chọn ảnh bìa: </label>
            <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {form.image && (
            <img src={form.image} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
        )}

        <div>
          <label>Loại bài viết: </label>
          <select name="type" value={form.type} onChange={handleChange} style={{ padding: 8, marginTop: 6 }}>
            <option value="">-- Chọn loại --</option>
            {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <button 
            onClick={handleSubmit} 
            disabled={isUploading}
            style={{ padding: 10, backgroundColor: isUploading ? '#ccc' : '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
        >
            {isUploading ? "Đang tải ảnh lên..." : (isEditing ? "Lưu thay đổi" : "Đăng bài mới")}
        </button>
        
        {isEditing && (
          <button onClick={() => { setIsEditing(false); setForm({ id: '', title: '', excerpt: '', content: '', image: '', date: '', type: '' }); setSelectedFile(null); }} style={{ marginTop: 5 }}>
            Hủy
          </button>
        )}
      </div>

      <div style={{ marginBottom: 12, maxWidth: 500, display: 'flex', gap: 8 }}>
        <input
          placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc nội dung..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 8, width: '70%' }}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: 8, width: '30%' }}>
          <option value="all">Tất cả loại</option>
          {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

       <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th>ID (Mongo)</th>
              <th>Ảnh</th>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Hành động</th>
            </tr>
          </thead>
        <tbody>
          {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              // Dùng _id làm key để tránh trùng lặp
              <tr key={post._id || post.id}>
                <td>
                    <small style={{fontSize: 10, color: '#666'}}>{post._id || post.id}</small>
                </td>
                <td style={{ textAlign: 'center' }}>
                    {post.image ? (
                        <img src={post.image} alt="Post" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                        <span style={{ fontSize: 12, color: '#888' }}>No IMG</span>
                    )}
                </td>
                <td>{post.title}</td>
                <td style={{ textTransform: 'capitalize' }}>{post.type || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(post)} style={{ marginRight: 5 }}>Sửa</button>
                  {/* Truyền _id vào hàm xóa */}
                  <button onClick={() => handleDelete(post._id || post.id, post)} style={{ color: 'red' }}>Xóa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5">Chưa có bài viết.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PostManager;