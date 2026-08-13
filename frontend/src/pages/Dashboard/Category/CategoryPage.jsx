import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productService from "../../../services/productService";
import categoryService from "../../../services/categoryService";
import ProductCard from "../../../components/ProductCard/ProductCard";
import { FaLayerGroup, FaCheckCircle } from "react-icons/fa";
import "./category.css";

function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [parentCat, setParentCat] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCatId, setSelectedSubCatId] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryAndProducts();
  }, [slug]);

  const loadCategoryAndProducts = async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách tất cả các danh mục
      const catRes = await categoryService.getAll();
      const categories = catRes || [];
      const currentCat = categories.find(c => c.slug === slug);

      if (currentCat) {
        // Kiểm tra xem danh mục hiện tại là danh mục gốc hay danh mục con
        let rootCategory = currentCat;
        let subCats = [];

        if (currentCat.parentId) {
          // Là danh mục con -> tìm danh mục gốc cha
          const parent = categories.find(c => c.id === currentCat.parentId);
          if (parent) {
            rootCategory = parent;
          }
          subCats = categories.filter(c => c.parentId === rootCategory.id);
          setCategoryName(rootCategory.name);
          setParentCat(rootCategory);
          setSubCategories(subCats);
          setSelectedSubCatId(currentCat.id);
        } else {
          // Là danh mục gốc
          subCats = categories.filter(c => c.parentId === currentCat.id);
          setCategoryName(currentCat.name);
          setParentCat(currentCat);
          setSubCategories(subCats);
          setSelectedSubCatId("ALL");
        }
        
        // 2. Lấy tất cả sản phẩm
        const prodRes = await productService.getProducts();
        const allProds = prodRes || [];
        
        // 3. Lấy danh sách ID của danh mục gốc và các danh mục con
        const childrenIds = subCats.map(c => c.id);
        const targetIds = [rootCategory.id, ...childrenIds];
        
        // Lọc tất cả sản phẩm thuộc nhóm ngành hàng này
        const categoryProducts = allProds.filter(p => targetIds.includes(p.categoryId));
        setAllProducts(categoryProducts);

      } else {
        setCategoryName("Danh mục không tồn tại");
        setAllProducts([]);
        setDisplayedProducts([]);
        setSubCategories([]);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật sản phẩm hiển thị dựa trên SubCategory được chọn
  useEffect(() => {
    if (selectedSubCatId === "ALL") {
      setDisplayedProducts(allProducts);
    } else {
      const filtered = allProducts.filter(p => p.categoryId === selectedSubCatId);
      setDisplayedProducts(filtered);
    }
  }, [selectedSubCatId, allProducts]);

  // Tính số lượng sản phẩm cho từng Brand chip
  const getProductCountForSub = (subId) => {
    if (subId === "ALL") return allProducts.length;
    return allProducts.filter(p => p.categoryId === subId).length;
  };

  return (
    <div className="category-page">
      {/* Category Header with Subcategory Chips */}
      <div className="category-header">
        <h1>{categoryName}</h1>
        <p>Khám phá bộ sưu tập sản phẩm {categoryName} chính hãng cao cấp</p>

        {/* Thanh lọc theo Hãng sản xuất / Danh mục con */}
        {subCategories.length > 0 && (
          <div className="brand-filter-wrapper">
            <span className="brand-filter-title">Hãng sản xuất:</span>
            <div className="brand-chips-container">
              <button
                className={`brand-chip ${selectedSubCatId === "ALL" ? "active" : ""}`}
                onClick={() => setSelectedSubCatId("ALL")}
              >
                <FaLayerGroup className="chip-icon" />
                Tất cả hãng
                <span className="chip-count">{getProductCountForSub("ALL")}</span>
              </button>

              {subCategories.map((sub) => {
                const count = getProductCountForSub(sub.id);
                return (
                  <button
                    key={sub.id}
                    className={`brand-chip ${selectedSubCatId === sub.id ? "active" : ""}`}
                    onClick={() => setSelectedSubCatId(sub.id)}
                  >
                    {selectedSubCatId === sub.id && <FaCheckCircle className="chip-icon check" />}
                    {sub.name}
                    <span className="chip-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="spinner"></div>
            <span>Đang tải dữ liệu sản phẩm...</span>
          </div>
        </div>
      ) : (
        <div className="products-grid">
          {displayedProducts.length > 0 ? (
            displayedProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))
          ) : (
            <div className="no-products">
              <p>Hiện chưa có sản phẩm nào thuộc hãng này.</p>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Vui lòng chọn hãng khác hoặc xem Tất cả hãng!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
