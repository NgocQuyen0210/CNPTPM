import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productService from "../../../services/productService";
import { useCart } from "../../../context/CartContext";
import { getRealProductImage, getFallbackImage } from "../../../services/imageService";
import "./product.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(null);

  // Hover Zoom States
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Flying Cart Animation Logic
  const runFlyingCartAnimation = () => {
    const imgEl = document.getElementById("detail-main-image");
    const cartEl = document.getElementById("header-cart-icon");
    if (!imgEl || !cartEl) return;

    const imgRect = imgEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();

    // Tạo bản sao của ảnh
    const clone = imgEl.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = `${imgRect.left}px`;
    clone.style.top = `${imgRect.top}px`;
    clone.style.width = `${imgRect.width}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.zIndex = "999999";
    clone.style.borderRadius = "12px";
    clone.style.pointerEvents = "none";
    clone.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";

    document.body.appendChild(clone);

    // Bắt đầu di chuyển
    requestAnimationFrame(() => {
      clone.style.left = `${cartRect.left + 15}px`;
      clone.style.top = `${cartRect.top + 10}px`;
      clone.style.width = "20px";
      clone.style.height = "20px";
      clone.style.opacity = "0.2";
      clone.style.transform = "scale(0.1) rotate(360deg)";
    });

    // Sau khi bay xong
    setTimeout(() => {
      clone.remove();
      // Thêm class lắc rung vào giỏ hàng
      cartEl.classList.add("shake-anim");
      setTimeout(() => {
        cartEl.classList.remove("shake-anim");
      }, 600);
    }, 800);
  };

  // Pre-order Modal States
  const [showPreorderModal, setShowPreorderModal] = useState(false);
  const [preorderForm, setPreorderForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    notes: ""
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (showPreorderModal) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setPreorderForm(prev => ({
          ...prev,
          fullName: user.fullName || "",
          email: user.email || ""
        }));
      }
    }
  }, [showPreorderModal]);

  // Chuẩn hóa URL ảnh để so sánh trùng lặp chính xác (loại bỏ query params và protocol/domain)
  const normalizeUrl = (url) => {
    if (!url) return "";
    let cleaned = url.split("?")[0].trim();
    try {
      if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
        const parsed = new URL(cleaned);
        cleaned = parsed.pathname;
      }
    } catch (e) {
      // Bỏ qua nếu không phải URL tuyệt đối hợp lệ
    }
    return cleaned.replace(/^\/+|\/+$/g, "");
  };

  // Tạo từ khóa tìm kiếm hình ảnh động dựa theo tên sản phẩm và danh mục để đảm bảo độ chính xác
  const getProductKeywords = (prod) => {
    if (!prod) return { specific: "", fallback: "" };
    const brand = (prod.brand || "").toLowerCase().trim();
    const name = (prod.name || "").toLowerCase();

    // Chuyển tiếng Việt có dấu sang không dấu
    const unsignedName = (prod.name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .toLowerCase();

    // Tách các từ trong tên sản phẩm và lọc bỏ các từ chung chung
    const words = unsignedName
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 1 && w !== brand && w !== "pro" && w !== "max" && w !== "ultra" && w !== "plus" && w !== "inch" && w !== "chinh" && w !== "hang" && w !== "viet" && w !== "nam");

    // Lấy tối đa 2 từ khóa đặc trưng nhất
    const specificWords = words.slice(0, 2);

    let typeKeyword = "accessory";
    const catId = prod.categoryId;
    if (catId === 1 || catId === 4 || catId === 5 || catId === 11 || catId === 35 || catId === 36 || catId === 37 || catId === 38 || catId === 39 || catId === 40 || catId === 41 || catId === 42 || catId === 22 || catId === 23) {
      typeKeyword = "phone";
      if (name.includes("tablet") || name.includes("ipad") || name.includes("tab")) {
        typeKeyword = "tablet";
      }
    } else if (catId === 2 || catId === 13 || catId === 14 || catId === 15 || catId === 16 || catId === 17 || catId === 18 || catId === 19 || catId === 20 || catId === 21) {
      typeKeyword = "laptop";
    } else if (catId === 12 || catId === 24 || catId === 25) {
      typeKeyword = "smartwatch";
    } else if (catId === 3 || catId === 26 || catId === 27 || catId === 30 || catId === 33) {
      typeKeyword = "headphones";
      if (name.includes("loa") || name.includes("speaker")) {
        typeKeyword = "speaker";
      }
    }

    if (name.includes("airtag")) return { specific: "airtag", fallback: "airtag" };
    if (name.includes("keychron")) return { specific: "mechanical,keyboard", fallback: "keyboard" };
    if (name.includes("logitech")) return { specific: "logitech,mouse", fallback: "logitech" };

    // Luôn luôn đính kèm thương hiệu (brand) ở đầu để Unsplash lọc chính xác hãng sản xuất
    return {
      specific: brand ? [brand, ...specificWords].join(",") : typeKeyword,
      fallback: brand ? [brand, typeKeyword].join(",") : typeKeyword
    };
  };

  // Lấy danh sách ảnh hiển thị (tối thiểu 3 ảnh) phân loại chính xác theo thương hiệu/danh mục và chống trùng lặp giữa các sản phẩm
  const getDisplayImages = (prod) => {
    if (!prod) return [];
    const list = [];
    const normalizedList = [];

    const addImage = (url) => {
      if (!url || typeof url !== 'string') return;
      const trimmed = url.trim();
      if (!trimmed || (!trimmed.startsWith("http://") && !trimmed.startsWith("https://"))) return;
      const normalized = normalizeUrl(trimmed);
      if (!normalizedList.includes(normalized)) {
        list.push(trimmed);
        normalizedList.push(normalized);
      }
    };

    // 1. Thêm ảnh chính được ánh xạ chính hãng từ imageService
    const mainImg = getRealProductImage(prod);
    if (mainImg) {
      addImage(mainImg);
    }

    // 2. Thêm các ảnh từ gallery trong DB
    if (prod.images && prod.images.length > 0) {
      prod.images.forEach(img => {
        if (img.imageUrl) {
          addImage(img.imageUrl);
        }
      });
    }

    // 3. Gọi Unsplash Featured API với từ khóa chính xác nhất dựa theo Thương hiệu và Model
    const queries = getProductKeywords(prod);
    const id = prod.id || 0;

    let suffixIdx = 1;
    // Thử thêm 2 ảnh động từ Unsplash với từ khóa thương hiệu + model để có sự riêng biệt cho từng dòng máy
    while (list.length < 3 && suffixIdx <= 2) {
      const keywordQuery = suffixIdx === 1 ? queries.specific : queries.fallback;
      const suffix = suffixIdx === 1 ? "detail" : "side";
      const nextImg = `https://images.unsplash.com/featured/800x800/?${keywordQuery},${suffix}&sig=${id + suffixIdx * 100}`;
      addImage(nextImg);
      suffixIdx++;
    }

    // Kho ảnh mẫu chất lượng cao dự phòng (fallback) phân loại nghiêm ngặt nếu Unsplash bị lỗi hoặc không có ảnh động
    const pools = {
      phone: {
        apple: [
          "https://cdn2.cellphones.com.vn/200x/media/catalog/product/i/p/iphone-14-pro_2__4.png", // iPhone 14 Pro
          "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=800", // iPhones back
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800"  // iPhone 15 Pro Max
        ],
        samsung: [
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800", // Samsung Galaxy front
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800", // Galaxy Fold screen
          "https://images.unsplash.com/photo-1610945415295-d9b4f01d3a6c?q=80&w=800"  // Galaxy side view
        ],
        other: [
          "https://images.unsplash.com/photo-1598327106026-d9521da673d1?q=80&w=800", // Android screen close up
          "https://images.unsplash.com/photo-1605405748313-a416a1b84491?q=80&w=800", // Triple camera phone back
          "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?q=80&w=800"  // Modern triple camera
        ]
      },
      laptop: {
        apple: [
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800", // MacBook Pro
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800", // MacBook on desk
          "https://images.unsplash.com/photo-1496181130204-755241544e35?q=80&w=800"  // MacBook minimal
        ],
        other: [
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800", // Windows laptop
          "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800", // Dell XPS screen
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800"  // Gaming laptop RGB
        ]
      },
      watch: {
        apple: [
          "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800", // Apple Watch
          "https://images.unsplash.com/photo-1517502884422-41eaaced0168?q=80&w=800"  // Apple Watch close up
        ],
        other: [
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800", // Samsung Galaxy Watch style
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800"  // Smart watch
        ]
      },
      audio: {
        apple: [
          "https://images.unsplash.com/photo-1588449668365-d15e397f6787?q=80&w=800", // AirPods
          "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=800"  // AirPods Max
        ],
        other: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800", // Premium headphones
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800"  // Loa bluetooth
        ]
      },
      accessory: {
        apple: [
          "https://images.unsplash.com/photo-1629126786844-3453b34208a0?q=80&w=800", // AirTags
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800"  // Apple case
        ],
        other: [
          "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800", // Bàn phím cơ
          "https://images.unsplash.com/photo-1625842268584-8f329044703b?q=80&w=800"  // Chuột Logitech
        ]
      }
    };

    // Xác định phân loại danh mục
    let catType = 'accessory';
    const catId = prod.categoryId;
    if (catId === 1 || catId === 4 || catId === 5 || catId === 11 || catId === 35 || catId === 36 || catId === 37 || catId === 38 || catId === 39 || catId === 40 || catId === 41 || catId === 42 || catId === 22 || catId === 23) {
      catType = 'phone';
    } else if (catId === 2 || catId === 13 || catId === 14 || catId === 15 || catId === 16 || catId === 17 || catId === 18 || catId === 19 || catId === 20 || catId === 21) {
      catType = 'laptop';
    } else if (catId === 12 || catId === 24 || catId === 25) {
      catType = 'watch';
    } else if (catId === 3 || catId === 26 || catId === 27 || catId === 30 || catId === 33) {
      catType = 'audio';
    }

    // Chọn sub-pool theo thương hiệu
    const categoryPool = pools[catType] || pools.accessory;
    const brand = (prod.brand || "").toLowerCase();
    let brandKey = 'other';
    if (brand === 'apple') brandKey = 'apple';
    else if (brand === 'samsung' && categoryPool.samsung) brandKey = 'samsung';

    const pool = categoryPool[brandKey] || categoryPool.other;

    const hash = (num) => {
      let x = Math.sin(num) * 10000;
      return Math.floor((x - Math.floor(x)) * 1000);
    };

    // Bù thêm từ pool tĩnh cho đủ tối thiểu 3 ảnh
    const startIdx = hash(prod.id || 0) % pool.length;
    let fallbackIdx = 0;
    while (list.length < 3) {
      const nextImg = pool[(startIdx + fallbackIdx) % pool.length];
      addImage(nextImg);
      fallbackIdx++;
    }

    return list;
  };

  const fetchProduct = async () => {
    try {
      const res = await productService.getProductById(id);
      setProduct(res);
      if (res && res.variants && res.variants.length > 0) {
        setSelectedVariant(res.variants[0]);
      }
      // Set ảnh chính mặc định từ danh sách ảnh hiển thị đã được bổ sung
      if (res) {
        const displayImgs = getDisplayImages(res);
        if (displayImgs.length > 0) {
          setSelectedImage(displayImgs[0]);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVariantsLabel = () => {
    if (!product || !product.categoryId) return "Chọn phiên bản:";
    const catId = product.categoryId;
    if (catId === 1 || catId === 4 || catId === 5) {
      return "Chọn phiên bản (Dung lượng - Màu sắc):";
    } else if (catId === 2) {
      return "Chọn cấu hình (RAM - SSD - CPU):";
    } else if (catId === 8 || catId === 9 || catId === 10 || catId === 6 || catId === 7) {
      return "Chọn kích thước (Size):";
    }
    return "Chọn màu sắc / phân loại:";
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!product) return <div className="loading-container">Sản phẩm không tồn tại.</div>;

  const handleAddToCart = async () => {
    try {
      await addToCart({ id: product.id, name: product.name }, quantity, selectedVariant?.id);
      runFlyingCartAnimation();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart({ id: product.id }, quantity, selectedVariant?.id);
      navigate("/dashboard/checkout");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitPreorder = (e) => {
    e.preventDefault();
    if (!preorderForm.fullName.trim() || !preorderForm.phone.trim()) {
      alert("Vui lòng điền đầy đủ Họ tên và Số điện thoại!");
      return;
    }
    alert(`Đặt trước hàng thành công cho sản phẩm ${product.name}! Chúng tôi sẽ liên hệ với bạn qua số điện thoại ${preorderForm.phone} ngay khi sản phẩm có hàng.`);
    setShowPreorderModal(false);
    setPreorderForm({
      fullName: "",
      phone: "",
      email: "",
      notes: ""
    });
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-card">
        
        {/* Cột Trái: Ảnh Gallery */}
        <div className="product-gallery">
          {/* Ảnh lớn chính */}
          <div 
            className="detail-img-main"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            style={{ overflow: "hidden", position: "relative", cursor: "zoom-in" }}
          >
            <img 
              id="detail-main-image"
              src={selectedImage || getRealProductImage(product) || "https://via.placeholder.com/500"} 
              alt={product.name} 
              className="detail-img"
              style={{
                transformOrigin: isZooming ? `${zoomPos.x}% ${zoomPos.y}%` : "center",
                transform: isZooming ? "scale(1.8)" : "scale(1)",
                transition: isZooming ? "none" : "transform 0.3s ease",
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getFallbackImage(product);
              }}
            />
          </div>
          {/* Thumbnails */}
          {(() => {
            const displayImages = getDisplayImages(product);
            return displayImages && displayImages.length > 1 && (
              <div className="detail-thumbnails">
                {displayImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className={`thumb-item ${selectedImage === imgUrl ? "thumb-active" : ""}`}
                    onClick={() => setSelectedImage(imgUrl)}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} ${idx + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getFallbackImage(product);
                      }}
                    />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Cột Phải: Thông tin */}
        <div className="product-meta">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0 }}>{product.name}</h1>
            {product.status === "COMING_SOON" ? (
              <span className="status-badge coming-soon" style={{ padding: "6px 12px", fontSize: "12.5px" }}>Hàng sắp về</span>
            ) : product.status === "OUT_OF_STOCK" ? (
              <span className="status-badge out-of-stock" style={{ padding: "6px 12px", fontSize: "12.5px" }}>Đã hết</span>
            ) : (
              <span className="status-badge selling" style={{ padding: "6px 12px", fontSize: "12.5px" }}>Đang bán</span>
            )}
          </div>
          <div className="detail-price">
            {selectedVariant ? selectedVariant.price?.toLocaleString("vi-VN") : product.price?.toLocaleString("vi-VN")}đ
          </div>
          
          <div className="detail-info-box">
            <p><strong>Thương hiệu:</strong> {product.brand || "Đang cập nhật"}</p>
            <p><strong>Mô tả ngắn:</strong> {product.summary || "Chưa có mô tả"}</p>
          </div>

          {/* Hộp chọn Variant đặc trưng (Màu sắc, Dung lượng, Cấu hình, Size) */}
          {product.variants && product.variants.length > 0 && (
            <div className="product-variants-wrapper">
              <span className="variants-label">{getVariantsLabel()}</span>
              <div className="variants-list">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    className={`variant-item-btn ${selectedVariant?.id === v.id ? "selected" : ""}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hiển thị số lượng chỉ khi đang bán */}
          {(!product.status || product.status === "SELLING") && (
            <div className="quantity-control-wrapper">
              <span className="quantity-label">Số lượng:</span>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="text" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          )}

          <div className="actions-wrapper">
            {product.status === "COMING_SOON" ? (
              <button onClick={() => setShowPreorderModal(true)} className="btn-preorder-detail">
                Đặt trước
              </button>
            ) : product.status === "OUT_OF_STOCK" ? (
              <div className="out-of-stock-message">Sản phẩm hiện đã hết hàng</div>
            ) : (
              <>
                <button onClick={handleAddToCart} className="btn-add-cart-detail">
                  Thêm vào giỏ hàng
                </button>
                <button onClick={handleBuyNow} className="btn-buy-now-detail">
                  Mua ngay
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="detail-specs-box">
        <h2>Chi tiết sản phẩm</h2>
        <div className="specs-content">
          {product.content || "Nội dung chi tiết đang được cập nhật."}
        </div>
      </div>

      {/* Pre-order Modal */}
      {showPreorderModal && (
        <div className="preorder-modal-backdrop" onClick={() => setShowPreorderModal(false)}>
          <div className="preorder-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Đăng ký đặt trước sản phẩm</h2>
            <p className="preorder-sub">Vui lòng để lại thông tin của bạn. Chúng tôi sẽ liên hệ ngay khi có hàng.</p>
            
            <form onSubmit={handleSubmitPreorder} className="preorder-form">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input 
                  type="text" 
                  value={preorderForm.fullName} 
                  onChange={(e) => setPreorderForm({...preorderForm, fullName: e.target.value})}
                  required 
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input 
                  type="tel" 
                  value={preorderForm.phone} 
                  onChange={(e) => setPreorderForm({...preorderForm, phone: e.target.value})}
                  required 
                  placeholder="Nhập số điện thoại để liên hệ"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={preorderForm.email} 
                  onChange={(e) => setPreorderForm({...preorderForm, email: e.target.value})}
                  placeholder="Nhập email (không bắt buộc)"
                />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea 
                  value={preorderForm.notes} 
                  onChange={(e) => setPreorderForm({...preorderForm, notes: e.target.value})}
                  placeholder="Ghi chú thêm (số lượng cần mua, thời gian liên hệ...)"
                  rows="3"
                />
              </div>
              
              <div className="preorder-actions">
                <button type="button" onClick={() => setShowPreorderModal(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-confirm">Xác nhận đặt trước</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
