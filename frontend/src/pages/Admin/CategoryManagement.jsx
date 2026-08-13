import React, { useState, useEffect } from "react";
import categoryService from "../../services/categoryService";

// React Icons
import { 
  FaPlus, FaEdit, FaTrash, FaTimes, FaLayerGroup, 
  FaFolder, FaSearch, FaChevronRight 
} from "react-icons/fa";
import "./ProductManagement.css"; // Reuse the premium modal, table, and stats styling

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      // Phía Admin chỉ quản lý 5 danh mục chính (danh mục gốc, parentId == null)
      const rootCategories = (res || []).filter(c => !c.parentId);
      setCategories(rootCategories);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setForm({ name: "", slug: "", description: "" });
    setShowModal(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || ""
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await categoryService.update(editingId, form);
      } else {
        await categoryService.create(form);
      }
      setShowModal(false);
      setForm({ name: "", slug: "", description: "" });
      setEditingId(null);
      fetchCategories();
      alert(editingId ? "Cập nhật danh mục thành công!" : "Tạo danh mục thành công!");
    } catch (error) {
      console.error("Lỗi lưu danh mục:", error);
      alert("Lưu thất bại. Vui lòng kiểm tra lại tên, mã slug (phải là duy nhất).");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryService.delete(id);
        fetchCategories();
        alert("Xóa danh mục thành công!");
      } catch (error) {
        console.error("Lỗi xóa danh mục:", error);
        alert("Không thể xóa danh mục này. Vui lòng kiểm tra xem có sản phẩm nào đang thuộc danh mục này hay không.");
      }
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter(cat => 
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>Quản lý Danh mục (Categories)</h2>
        <button onClick={handleOpenCreateModal} className="btn-add-product">
          <FaPlus /> Thêm Danh mục
        </button>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="stats-grid">
        <div className="stat-card" style={{ gridColumn: "span 2" }}>
          <div className="stat-icon purple">
            <FaLayerGroup />
          </div>
          <div className="stat-info">
            <h3>Tổng số Danh mục</h3>
            <p>{categories.length}</p>
          </div>
        </div>

        <div className="stat-card" style={{ gridColumn: "span 2" }}>
          <div className="stat-icon blue">
            <FaFolder />
          </div>
          <div className="stat-info">
            <h3>Danh mục Hoạt động</h3>
            <p>{filteredCategories.length}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <div className="filter-search" style={{ flex: "1" }}>
          <FaSearch className="filter-search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: "80px" }}>ID</th>
            <th>Tên danh mục</th>
            <th>Mã Slug</th>
            <th>Mô tả chi tiết</th>
            <th style={{ width: "180px" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td style={{ fontWeight: "600", color: "var(--text-primary)", textAlign: "left" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaChevronRight style={{ fontSize: "10px", color: "var(--primary)" }} /> {cat.name}
                </span>
              </td>
              <td style={{ fontFamily: "monospace" }}>{cat.slug}</td>
              <td style={{ textAlign: "left", fontSize: "13px" }}>{cat.description || "—"}</td>
              <td>
                <button onClick={() => handleOpenEditModal(cat)} className="btn-action-edit">Sửa</button>
                <button onClick={() => handleDelete(cat.id)} className="btn-action-delete">Xóa</button>
              </td>
            </tr>
          ))}
          {filteredCategories.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: "40px", color: "var(--text-muted)" }}>
                Không tìm thấy danh mục nào khớp.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- ADD / EDIT CATEGORY MODAL --- */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>{editingId ? `Chỉnh sửa: ${form.name}` : "Tạo danh mục mới"}</h3>
              <button onClick={() => setShowModal(false)} className="btn-modal-close">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                  
                  <div className="form-group">
                    <label>Tên danh mục *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="VD: Điện thoại, Thiết bị thông minh" 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Mã Slug danh mục *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="VD: dien-thoai, thiet-bi-thong-minh" 
                      value={form.slug} 
                      onChange={e => setForm({...form, slug: e.target.value})} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Mô tả chi tiết</label>
                    <textarea 
                      placeholder="Nhập mô tả chi tiết của danh mục ngành hàng này..." 
                      value={form.description} 
                      onChange={e => setForm({...form, description: e.target.value})} 
                      rows="4" 
                    />
                  </div>

                </div>
              </div>
              
              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn-action-delete"
                  style={{ padding: "10px 20px" }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-add-product"
                  style={{ padding: "10px 24px", boxShadow: "none" }}
                >
                  {isSubmitting ? "Đang xử lý..." : editingId ? "Xác nhận lưu" : "Xác nhận tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManagement;
