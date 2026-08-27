import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import productService from "../../../services/productService";
import categoryService from "../../../services/categoryService";
import ProductCard from "../../../components/ProductCard/ProductCard";
import "./menu.css";

import { 
  FaMobileAlt, FaLaptop, FaStore, FaHeadphones, 
  FaTabletAlt, FaClock, FaLayerGroup, FaCheckCircle, FaThLarge 
} from "react-icons/fa";

const images = [
  "https://cdn2.cellphones.com.vn/x/media/catalog/product/i/p/iphone-17-pro-max_1_3.jpg", // iPhone 17 Pro Max
  "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1200&auto=format&fit=crop", // Laptop (MacBook màn hình rực rỡ)
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"  // Phụ kiện (Đồng hồ tối giản)
];

const mainCategoryConfigs = [
  {
    id: "all",
    label: "Tất cả danh mục",
    icon: <FaThLarge />,
    dbSlug: null,
  },
  {
    id: "dien-thoai",
    label: "Điện Thoại",
    icon: <FaMobileAlt />,
    dbSlug: "dien-thoai",
  },
  {
    id: "laptop",
    label: "Laptop",
    icon: <FaLaptop />,
    dbSlug: "laptop",
  },
  {
    id: "may-tinh-bang",
    label: "Máy tính bảng",
    icon: <FaTabletAlt />,
    dbSlug: "may-tinh-bang",
  },
  {
    id: "dong-ho-thong-minh",
    label: "Đồng hồ thông minh",
    icon: <FaClock />,
    dbSlug: "dong-ho-thong-minh",
  },
  {
    id: "phu-kien",
    label: "Phụ kiện công nghệ",
    icon: <FaHeadphones />,
    dbSlug: "phu-kien",
  },
];

function Menu() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  // Category & Subcategory Filter States on Homepage
  const [selectedMainCatSlug, setSelectedMainCatSlug] = useState(null); // null means All
  const [selectedSubCatId, setSelectedSubCatId] = useState(null); // null means All brands in that cat

  // Filters and Pagination States
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPrice, setFilterPrice] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPrice, searchQuery, selectedMainCatSlug, selectedSubCatId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts(),
        categoryService.getAll()
      ]);
      setProducts(prodRes || []);
      setCategoriesList(catRes || []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin danh mục chính hiện tại
  const currentMainCatObj = categoriesList.find(c => c.slug === selectedMainCatSlug && !c.parentId);

  // Lấy các danh mục con (hãng sản xuất) của danh mục chính hiện tại
  const subCategoriesOfActiveCat = currentMainCatObj 
    ? categoriesList.filter(c => c.parentId === currentMainCatObj.id)
    : [];

  const handleSelectMainCat = (slug) => {
    if (selectedMainCatSlug === slug) {
      // Toggle back to All
      setSelectedMainCatSlug(null);
      setSelectedSubCatId(null);
    } else {
      setSelectedMainCatSlug(slug);
      setSelectedSubCatId(null);
    }
  };

  const getFilteredProducts = () => {
    return products.filter((prod) => {
      // 1. Filter by Main Category & Subcategory
      if (selectedMainCatSlug && currentMainCatObj) {
        if (selectedSubCatId) {
          if (prod.categoryId !== selectedSubCatId) return false;
        } else {
          const subIds = subCategoriesOfActiveCat.map(s => s.id);
          const validIds = [currentMainCatObj.id, ...subIds];
          if (!validIds.includes(prod.categoryId)) return false;
        }
      }

      // 2. Filter by Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        if (!prod.name.toLowerCase().includes(query) && 
            !(prod.brand && prod.brand.toLowerCase().includes(query))) {
          return false;
        }
      }

      // 3. Filter by Status
      if (filterStatus !== "ALL") {
        if (filterStatus === "SELLING") {
          if (prod.status && prod.status !== "SELLING") return false;
        } else {
          if (prod.status !== filterStatus) return false;
        }
      }
      
      // 4. Filter by Price
      const price = prod.price;
      if (filterPrice === "UNDER_500K" && price >= 500000) return false;
      if (filterPrice === "500K_2M" && (price < 500000 || price > 2000000)) return false;
      if (filterPrice === "2M_10M" && (price < 2000000 || price > 10000000)) return false;
      if (filterPrice === "OVER_10M" && price <= 10000000) return false;
      
      return true;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  // Pagination Calculations
  const filteredList = getFilteredProducts();
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredList.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredList.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const productsSection = document.getElementById("all-products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="menu">
      {/* ===== SLIDER ===== */}
      <div className="slider-container">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            className={`slider-img ${index === currentIndex ? "active" : ""}`}
            alt="slide"
          />
        ))}
        <button className="prev" onClick={prevSlide}>
          ⬅
        </button>
        <button className="next" onClick={nextSlide}>
          ➡
        </button>
      </div>

      {/* ===== CATEGORIES GRID ===== */}
      <div className="categories-wrapper">
        <div className="categories">
          {mainCategoryConfigs.map((cat) => {
            const isActive = cat.dbSlug === null ? selectedMainCatSlug === null : selectedMainCatSlug === cat.dbSlug;
            return (
              <div 
                key={cat.id} 
                className={`item ${isActive ? "active" : ""}`} 
                onClick={() => handleSelectMainCat(cat.dbSlug)}
              >
                <div className="item-icon">{cat.icon}</div>
                <span className="item-label">{cat.label}</span>
              </div>
            );
          })}
        </div>

        {/* ===== SUB-CATEGORIES / BRAND CHIPS ROW ===== */}
        {selectedMainCatSlug && subCategoriesOfActiveCat.length > 0 && (
          <div className="home-subcategories-bar">
            <span className="sub-bar-title">Hãng sản xuất:</span>
            <div className="sub-chips-grid">
              <button
                className={`sub-chip ${selectedSubCatId === null ? "active" : ""}`}
                onClick={() => setSelectedSubCatId(null)}
              >
                <FaLayerGroup className="sub-chip-icon" />
                Tất cả {currentMainCatObj?.name}
              </button>

              {subCategoriesOfActiveCat.map((sub) => (
                <button
                  key={sub.id}
                  className={`sub-chip ${selectedSubCatId === sub.id ? "active" : ""}`}
                  onClick={() => setSelectedSubCatId(sub.id)}
                >
                  {selectedSubCatId === sub.id && <FaCheckCircle className="sub-chip-icon check" />}
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== ALL PRODUCTS SECTION ===== */}
      <div id="all-products-section" style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <h2 className="menu-section-title" style={{ margin: 0 }}>
            {searchQuery ? (
              <>Kết quả tìm kiếm cho: <span style={{ color: "var(--accent-pink)" }}>"{searchQuery}"</span></>
            ) : selectedMainCatSlug ? (
              <>
                <FaStore /> {currentMainCatObj?.name} 
                {selectedSubCatId && (
                  <span style={{ fontSize: "1.1rem", color: "var(--primary)", fontWeight: "600" }}>
                    {" > "}{categoriesList.find(c => c.id === selectedSubCatId)?.name}
                  </span>
                )}
              </>
            ) : (
              <><FaStore /> Tất cả sản phẩm</>
            )}
          </h2>

          {(searchQuery || selectedMainCatSlug) && (
            <button 
              onClick={() => {
                setSelectedMainCatSlug(null);
                setSelectedSubCatId(null);
                if (searchQuery) navigate("/dashboard/menu");
              }}
              className="page-btn"
              style={{ width: "auto", padding: "0 16px", borderRadius: "10px", fontSize: "13.5px" }}
            >
              Xem tất cả sản phẩm
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <div className="products-filters-container">
          <div className="filter-group">
            <label htmlFor="status-filter">Tình trạng:</label>
            <select 
              id="status-filter" 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả tình trạng</option>
              <option value="SELLING">Đang bán</option>
              <option value="COMING_SOON">Hàng sắp về</option>
              <option value="OUT_OF_STOCK">Đã hết</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="price-filter">Khoảng giá:</label>
            <select 
              id="price-filter" 
              className="filter-select"
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
            >
              <option value="ALL">Tất cả mức giá</option>
              <option value="UNDER_500K">Dưới 500.000đ</option>
              <option value="500K_2M">500.000đ - 2.000.000đ</option>
              <option value="2M_10M">2.000.000đ - 10.000.000đ</option>
              <option value="OVER_10M">Trên 10.000.000đ</option>
            </select>
          </div>
          
          <div style={{ marginLeft: "auto", fontSize: "14px", color: "var(--text-muted)", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
            {filteredList.length === products.length ? (
              <span>Tổng: <strong style={{ color: "var(--text-primary)" }}>{products.length}</strong> sản phẩm</span>
            ) : (
              <span>
                Tìm thấy <strong style={{ color: "var(--primary, #a78bfa)" }}>{filteredList.length}</strong>
                <span style={{ margin: "0 4px" }}>/</span>
                Tổng <strong style={{ color: "var(--text-primary)" }}>{products.length}</strong> sản phẩm
              </span>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Đang tải danh sách sản phẩm...</span>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {currentProducts.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
              {filteredList.length === 0 && (
                <div style={{ color: "var(--text-muted)", gridColumn: "1 / -1", textAlign: "center", padding: "60px" }}>
                  Không tìm thấy sản phẩm nào khớp với bộ lọc.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button 
                  className="page-btn" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`page-btn ${currentPage === pageNum ? "active-page-btn" : ""}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button 
                  className="page-btn" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Menu;
