import React, { useState, useEffect } from "react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import supplierService from "../../services/supplierService";
import productVariantService from "../../services/productVariantService";
import "./ProductManagement.css";

// React Icons
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, 
  FaBoxOpen, FaTags, FaTruck, FaImage, FaBarcode, 
  FaExclamationTriangle, FaFilter, FaLayerGroup 
} from "react-icons/fa";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("id-desc");

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  
  // Selected product context for variants
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variantsList, setVariantsList] = useState([]);

  // Product Form state
  const [form, setForm] = useState({
    name: "", slug: "", summary: "", content: "", brand: "", price: "", featuredImage: "", categoryId: "", supplierId: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Variant Form state
  const [variantForm, setVariantForm] = useState({
    name: "", sku: "", price: "", stockQuantity: ""
  });
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const prodRes = await productService.getProducts();
      setProducts(prodRes || []);
      
      const catRes = await categoryService.getAll();
      setCategories(catRes || []);

      const supRes = await supplierService.getAll();
      setSuppliers(supRes || []);
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu:", error);
    }
  };

  // --- Product CRUD ---
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setForm({
      name: "", slug: "", summary: "", content: "", brand: "", price: "", featuredImage: "", categoryId: "", supplierId: ""
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingId(prod.id);
    setForm({
      name: prod.name,
      slug: prod.slug,
      summary: prod.summary || "",
      content: prod.content || "",
      brand: prod.brand || "",
      price: prod.price || "",
      featuredImage: prod.featuredImage || "",
      categoryId: prod.categoryId || (prod.category ? prod.category.id : ""),
      supplierId: prod.supplierId || (prod.supplier ? prod.supplier.id : "")
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        supplierId: form.supplierId ? parseInt(form.supplierId) : null
      };

      if (editingId) {
        await productService.updateProduct(editingId, payload);
      } else {
        await productService.createProduct(payload);
      }

      setShowProductModal(false);
      fetchData();
      alert(editingId ? "Cập nhật sản phẩm thành công!" : "Tạo sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
      alert("Lỗi lưu dữ liệu. Vui lòng kiểm tra lại tên, slug, hoặc kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này cùng toàn bộ biến thể liên quan?")) {
      try {
        await productService.deleteProduct(id);
        fetchData();
        alert("Xóa sản phẩm thành công!");
      } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        alert("Không thể xóa sản phẩm. Vui lòng kiểm tra phân quyền hoặc dữ liệu liên kết.");
      }
    }
  };

  // --- Variant CRUD ---
  const handleOpenVariantModal = async (prod) => {
    setSelectedProduct(prod);
    setVariantForm({ name: "", sku: "", price: prod.price || "", stockQuantity: "" });
    setEditingVariantId(null);
    setShowVariantModal(true);
    fetchVariants(prod.id);
  };

  const fetchVariants = async (productId) => {
    try {
      const res = await productVariantService.getByProductId(productId);
      setVariantsList(res || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách biến thể:", error);
    }
  };

  const handleSaveVariant = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSavingVariant(true);

    try {
      const payload = {
        name: variantForm.name,
        sku: variantForm.sku,
        price: parseFloat(variantForm.price),
        stockQuantity: parseInt(variantForm.stockQuantity),
        productId: selectedProduct.id
      };

      if (editingVariantId) {
        await productVariantService.update(editingVariantId, payload);
      } else {
        await productVariantService.create(payload);
      }

      setVariantForm({ name: "", sku: "", price: selectedProduct.price || "", stockQuantity: "" });
      setEditingVariantId(null);
      fetchVariants(selectedProduct.id);
      fetchData(); // reload main table values
    } catch (error) {
      console.error("Lỗi lưu biến thể:", error);
      alert("Lỗi lưu biến thể. Vui lòng kiểm tra lại thông tin và mã SKU.");
    } finally {
      setIsSavingVariant(false);
    }
  };

  const handleEditVariant = (v) => {
    setEditingVariantId(v.id);
    setVariantForm({
      name: v.name,
      sku: v.sku,
      price: v.price || "",
      stockQuantity: v.stockQuantity || ""
    });
  };

  const handleDeleteVariant = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa biến thể này?")) {
      try {
        await productVariantService.delete(id);
        fetchVariants(selectedProduct.id);
        fetchData(); // reload main table values
      } catch (error) {
        console.error("Lỗi xóa biến thể:", error);
      }
    }
  };

  // --- Search, Filter & Sort Processing ---
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prod.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prod.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "" || prod.categoryId === parseInt(selectedCategory) || (prod.category && prod.category.id === parseInt(selectedCategory));
    const matchesBrand = selectedBrand === "" || prod.brand === selectedBrand;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "id-asc") return a.id - b.id;
    return b.id - a.id; // default: id-desc
  });

  // Calculate unique brands for filter
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Calculate Statistics
  const outOfStockCount = products.reduce((acc, prod) => {
    const hasNoStock = prod.variants && prod.variants.length > 0 && prod.variants.every(v => v.stockQuantity === 0);
    return hasNoStock ? acc + 1 : acc;
  }, 0);

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>Hệ thống Quản lý Sản phẩm</h2>
        <button onClick={handleOpenCreateModal} className="btn-add-product">
          <FaPlus /> Thêm Sản phẩm
        </button>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <FaBoxOpen />
          </div>
          <div className="stat-info">
            <h3>Tổng Sản phẩm</h3>
            <p>{products.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <FaLayerGroup />
          </div>
          <div className="stat-info">
            <h3>Danh mục</h3>
            <p>{categories.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pink">
            <FaTruck />
          </div>
          <div className="stat-info">
            <h3>Nhà Cung cấp</h3>
            <p>{suppliers.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FaExclamationTriangle />
          </div>
          <div className="stat-info">
            <h3>Hết hàng (Biến thể)</h3>
            <p>{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Section */}
      <div className="filter-bar">
        <div className="filter-search">
          <FaSearch className="filter-search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, thương hiệu, slug..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select 
            value={selectedBrand} 
            onChange={e => setSelectedBrand(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="id-desc">Mới nhất</option>
            <option value="id-asc">Cũ nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="name-asc">Tên (A-Z)</option>
            <option value="name-desc">Tên (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: "60px" }}>ID</th>
            <th style={{ width: "80px" }}>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Thương hiệu</th>
            <th>Danh mục</th>
            <th>Giá gốc</th>
            <th>Biến thể</th>
            <th style={{ width: "240px" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map(prod => (
            <tr key={prod.id}>
              <td>{prod.id}</td>
              <td>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {prod.featuredImage ? (
                    <img 
                      src={prod.featuredImage} 
                      alt="featured" 
                      width="45" 
                      height="45"
                      style={{ borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border-color)" }} 
                    />
                  ) : (
                    <div style={{ width: "45px", height: "45px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyCenter: "center" }}>
                      <FaImage style={{ color: "var(--text-muted)", margin: "auto" }} />
                    </div>
                  )}
                </div>
              </td>
              <td style={{ fontWeight: "600", color: "var(--text-primary)", textAlign: "left" }}>
                {prod.name}
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "normal", marginTop: "2px" }}>
                  {prod.slug}
                </div>
              </td>
              <td>
                <span className="badge badge-blue">{prod.brand || "—"}</span>
              </td>
              <td>
                <span className="badge badge-purple">{prod.categoryName || (prod.category ? prod.category.name : "Chưa phân loại")}</span>
              </td>
              <td style={{ fontWeight: "700", color: "var(--accent-pink)" }}>
                {prod.price?.toLocaleString("vi-VN")}đ
              </td>
              <td>
                <button 
                  onClick={() => handleOpenVariantModal(prod)}
                  className="badge badge-green"
                  style={{ cursor: "pointer", display: "inline-flex", gap: "6px", alignItems: "center", transition: "all 0.2s" }}
                >
                  <FaBarcode /> {prod.variants ? prod.variants.length : 0} cấu hình
                </button>
              </td>
              <td>
                <button onClick={() => handleOpenEditModal(prod)} className="btn-action-edit">Sửa</button>
                <button onClick={() => handleOpenVariantModal(prod)} className="btn-action-edit" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.2)" }}>Biến thể</button>
                <button onClick={() => handleDeleteProduct(prod.id)} className="btn-action-delete">Xóa</button>
              </td>
            </tr>
          ))}
          {sortedProducts.length === 0 && (
            <tr>
              <td colSpan="8" style={{ padding: "40px", color: "var(--text-muted)" }}>
                Không tìm thấy sản phẩm nào khớp với bộ lọc.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {showProductModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>{editingId ? `Chỉnh sửa: ${form.name}` : "Tạo sản phẩm mới"}</h3>
              <button onClick={() => setShowProductModal(false)} className="btn-modal-close">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit}>
              <div className="admin-modal-body">
                <div className="form-grid">
                  
                  <div className="form-group">
                    <label>Tên sản phẩm *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="VD: iPhone 15 Pro Max" 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Slug sản phẩm *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="VD: iphone-15-pro-max" 
                      value={form.slug} 
                      onChange={e => setForm({...form, slug: e.target.value})} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Giá niêm yết (VND) *</label>
                    <input 
                      required 
                      type="number" 
                      placeholder="VD: 30000000" 
                      value={form.price} 
                      onChange={e => setForm({...form, price: e.target.value})} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Thương hiệu (Brand)</label>
                    <input 
                      type="text" 
                      placeholder="VD: Apple, Samsung..." 
                      value={form.brand} 
                      onChange={e => setForm({...form, brand: e.target.value})} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Danh mục ngành hàng</label>
                    <select 
                      value={form.categoryId} 
                      onChange={e => setForm({...form, categoryId: e.target.value})}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Nhà cung cấp</label>
                    <select 
                      value={form.supplierId} 
                      onChange={e => setForm({...form, supplierId: e.target.value})}
                    >
                      <option value="">-- Chọn nhà cung cấp --</option>
                      {suppliers.map(sup => (
                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width image-preview-section">
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                      <label>Ảnh hiển thị nổi bật (Featured Image Link)</label>
                      <input 
                        type="text" 
                        placeholder="http://... hoặc tên file ảnh mẫu trong import.sql" 
                        value={form.featuredImage} 
                        onChange={e => setForm({...form, featuredImage: e.target.value})} 
                      />
                    </div>
                    <div className="preview-container">
                      {form.featuredImage ? (
                        <img 
                          src={form.featuredImage.startsWith("http") ? form.featuredImage : `/${form.featuredImage}`} 
                          alt="preview"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                          onLoad={(e) => {
                            e.target.style.display = "block";
                            if(e.target.nextSibling) e.target.nextSibling.style.display = "none";
                          }}
                        />
                      ) : null}
                      <div className="preview-placeholder" style={{ display: form.featuredImage ? "none" : "flex" }}>
                        <FaImage />
                        <span>Xem trước ảnh</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Mô tả ngắn gọn (Summary)</label>
                    <textarea 
                      placeholder="Tóm tắt thông tin quan trọng nhất của sản phẩm..." 
                      value={form.summary} 
                      onChange={e => setForm({...form, summary: e.target.value})} 
                      rows="2" 
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Mô tả chi tiết kỹ thuật (Content)</label>
                    <textarea 
                      placeholder="Nhập thông tin chi tiết đầy đủ của sản phẩm..." 
                      value={form.content} 
                      onChange={e => setForm({...form, content: e.target.value})} 
                      rows="4" 
                    />
                  </div>

                </div>
              </div>
              
              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowProductModal(false)} 
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
                  {isSubmitting ? "Đang tải lên..." : editingId ? "Xác nhận lưu" : "Xác nhận tải lên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DETAILED VARIANT MANAGER MODAL --- */}
      {showVariantModal && selectedProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal modal-large">
            <div className="admin-modal-header">
              <h3>Cấu hình Biến thể: {selectedProduct.name}</h3>
              <button onClick={() => setShowVariantModal(false)} className="btn-modal-close">
                <FaTimes />
              </button>
            </div>
            
            <div className="admin-modal-body">
              <div className="variant-layout">
                
                {/* Left side: Variant list */}
                <div className="variant-list-container">
                  <h4 style={{ margin: "0 0 16px 0", color: "var(--text-primary)", display: "flex", gap: "8px", alignItems: "center" }}>
                    <FaBarcode /> Danh sách cấu hình hiện có ({variantsList.length})
                  </h4>

                  <table className="admin-table" style={{ fontSize: "13px" }}>
                    <thead>
                      <tr>
                        <th>Tên cấu hình</th>
                        <th>Mã SKU</th>
                        <th>Giá tiền</th>
                        <th>Kho</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantsList.map(v => (
                        <tr key={v.id}>
                          <td style={{ fontWeight: "600", color: "var(--text-primary)" }}>{v.name}</td>
                          <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{v.sku}</td>
                          <td style={{ color: "var(--accent-pink)", fontWeight: "600" }}>{v.price?.toLocaleString("vi-VN")}đ</td>
                          <td>
                            <span className={`badge ${v.stockQuantity === 0 ? "badge-pink" : v.stockQuantity < 10 ? "badge-orange" : "badge-green"}`}>
                              {v.stockQuantity} sp
                            </span>
                          </td>
                          <td>
                            <button onClick={() => handleEditVariant(v)} className="btn-action-edit" style={{ padding: "4px 8px", fontSize: "11px" }}>Sửa</button>
                            <button onClick={() => handleDeleteVariant(v.id)} className="btn-action-delete" style={{ padding: "4px 8px", fontSize: "11px" }}>Xóa</button>
                          </td>
                        </tr>
                      ))}
                      {variantsList.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ padding: "20px", color: "var(--text-muted)" }}>
                            Sản phẩm này chưa được thiết lập biến thể cấu hình.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Right side: Add / Edit Variant form */}
                <div className="variant-form-container">
                  <form onSubmit={handleSaveVariant} className="variant-small-form">
                    <h4>{editingVariantId ? "Sửa biến thể" : "Thêm cấu hình mới"}</h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      
                      <div className="form-group">
                        <label>Tên biến thể *</label>
                        <input 
                          required 
                          type="text" 
                          placeholder="VD: 256GB - Xám Titan, Size M - Black" 
                          value={variantForm.name} 
                          onChange={e => setVariantForm({...variantForm, name: e.target.value})} 
                        />
                      </div>

                      <div className="form-group">
                        <label>Mã SKU biến thể *</label>
                        <input 
                          required 
                          type="text" 
                          placeholder="VD: IP15PM-256-GRY" 
                          value={variantForm.sku} 
                          onChange={e => setVariantForm({...variantForm, sku: e.target.value})} 
                        />
                      </div>

                      <div className="form-group">
                        <label>Giá bán riêng (VND) *</label>
                        <input 
                          required 
                          type="number" 
                          placeholder="VD: 31000000" 
                          value={variantForm.price} 
                          onChange={e => setVariantForm({...variantForm, price: e.target.value})} 
                        />
                      </div>

                      <div className="form-group">
                        <label>Số lượng tồn kho *</label>
                        <input 
                          required 
                          type="number" 
                          placeholder="VD: 50" 
                          value={variantForm.stockQuantity} 
                          onChange={e => setVariantForm({...variantForm, stockQuantity: e.target.value})} 
                        />
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button 
                          type="submit" 
                          className="btn-add-product" 
                          style={{ width: "100%", justifyContent: "center", boxShadow: "none" }}
                          disabled={isSavingVariant}
                        >
                          {isSavingVariant ? "Đang xử lý..." : editingVariantId ? "Cập nhật biến thể" : "Thêm cấu hình"}
                        </button>
                        {editingVariantId && (
                          <button 
                            type="button" 
                            onClick={() => { setEditingVariantId(null); setVariantForm({ name: "", sku: "", price: selectedProduct.price || "", stockQuantity: "" }); }}
                            className="btn-action-delete"
                            style={{ padding: "10px 16px" }}
                          >
                            Hủy
                          </button>
                        )}
                      </div>

                    </div>
                  </form>
                </div>

              </div>
            </div>
            
            <div className="admin-modal-footer">
              <button 
                type="button" 
                onClick={() => setShowVariantModal(false)} 
                className="btn-action-delete"
                style={{ padding: "10px 20px" }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductManagement;
