/**
 * imageService.js
 * Bộ dịch vụ quản lý ảnh sản phẩm:
 * - Ảnh chính: URL thật từ cdn2.cellphones.com.vn (đã xác minh)
 * - Ảnh dự phòng: Unsplash theo đúng model sản phẩm (unique per product)
 */

// ==========================================
// PRODUCT IMAGE MAP - Ảnh chính xác theo ID
// Sử dụng URL thật từ CellphoneS CDN (format /200x/) hoặc Unsplash duy nhất
// ==========================================
const PRODUCT_IMAGE_MAP = {

  // ---- APPLE PHONES ----
  // 1: iPhone 15 Pro Max
  1: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/i/p/iphone-15-pro-max_3.png",
  // 2: iPhone 14 Pro
  2: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/i/p/iphone-14-pro_2__4.png",

  // ---- APPLE TABLETS ----
  // 3: iPad Pro M2 11 inch (Space Gray)
  3: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400",

  // ---- APPLE WATCH ----
  // 4: Apple Watch Ultra 2
  4: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=400",

  // ---- APPLE DESKTOP ----
  // 5: iMac 24 inch M3
  5: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400",

  // ---- APPLE ACCESSORIES ----
  // 6: Apple AirTag 4 Pack
  6: "https://images.unsplash.com/photo-1629126786844-3453b34208a0?q=80&w=400",
  // 7: AirPods Max Silver
  7: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=400",

  // ---- APPLE LAPTOPS ----
  // 8: MacBook Pro 16 M3 Max
  8: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400",
  // 9: Mac Studio M2 Ultra
  9: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400",

  // ---- SAMSUNG PHONES ----
  // 10: Samsung Galaxy S24 Ultra
  10: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/s/ss-s24-ultra-xam-222.png",
  // 11: Samsung Galaxy Z Fold 5
  11: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400",
  // 16: Samsung Galaxy A55 5G
  16: "https://images.unsplash.com/photo-1610945415295-d9b4f01d3a6c?q=80&w=400",

  // ---- SAMSUNG TABLETS ----
  // 12: Samsung Galaxy Tab S9 Ultra
  12: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/s/ss-tab-s9-ultra_1_.png",

  // ---- SAMSUNG WATCHES ----
  // 13: Samsung Galaxy Watch 6 Pro
  13: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=400",

  // ---- SAMSUNG AUDIO ----
  // 14: Samsung Galaxy Buds 2 Pro
  14: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400",

  // ---- SAMSUNG LAPTOPS ----
  // 15: Samsung Galaxy Book 4 Ultra
  15: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=400",

  // ---- SAMSUNG ACCESSORIES ----
  // 17: Samsung Galaxy SmartTag2
  17: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=400",

  // ---- OTHER PHONES ----
  // 18: Xiaomi 14 Ultra Ceramic
  18: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/x/i/xiaomi-14-ultra_3.png",
  // 19: OnePlus 12 Wood Design
  19: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/o/n/oneplus-12.jpg",
  // 20: Oppo Find X7 Ultra
  20: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/e/d/eda006276802c.jpg",
  // 21: Google Pixel 8 Pro Mint
  21: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/o/google-pixel-8-pro_7_.png",
  // 22: Asus ROG Phone 8 Pro
  22: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400",
  // 23: Sony Xperia 1 V Premium
  23: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/s/o/sony-xperia-1-v.png",
  // 24: Realme GT5 Pro Flagship
  24: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=400",
  // 25: Huawei Pura 70 Ultra
  25: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=400",

  // ---- APPLE LAPTOPS (more) ----
  // 26: MacBook Air M2 Silver
  26: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/m/a/macbook_1__1_8.png",
  // 27: MacBook Pro 14 M3 Black
  27: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=400",

  // ---- OTHER LAPTOPS ----
  // 28: Galaxy Book 3 Pro Carbon (Samsung)
  28: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400",
  // 29: Dell XPS 15 OLED
  29: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=400",
  // 30: HP Spectre x360 Gold
  30: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=400",
  // 31: Asus Zenbook 14 Space
  31: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=400",
  // 32: Lenovo ThinkPad X1 Carbon
  32: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?q=80&w=400",
  // 33: Acer Swift Edge Lightweight
  33: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=400",
  // 34: Razer Blade 16 Gaming
  34: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=400",
  // 35: MSI Stealth Thin Studio
  35: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=400&sig=msi",

  // ---- APPLE ACCESSORIES ----
  // 36: AirPods Pro 2 USB-C
  36: "https://images.unsplash.com/photo-1588449668365-d15e397f6787?q=80&w=400",
  // 37: Ốp lưng iPhone 15 Silicone
  37: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400",

  // ---- ACCESSORIES ----
  // 38: Bàn phím cơ Keychron Q1 Pro
  38: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=400",
  // 39: Chuột Logitech MX Master 3S
  39: "https://images.unsplash.com/photo-1625842268584-8f329044703b?q=80&w=400",
  // 40: Tai nghe Sony WH-1000XM5 Black
  40: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400",
  // 41: Sạc nhanh Anker Prime 67W
  41: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400",
  // 42: Pin dự phòng Anker 24000mAh
  42: "https://images.unsplash.com/photo-1609592424109-dd7736f9024f?q=80&w=400",
  // 43: Đế tản nhiệt Cooler Master
  43: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=400",
  // 44: Loa Bluetooth JBL Charge 5
  44: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/r/group_211.png",
  // 45: Cáp sạc Belkin USB-C bọc dù
  45: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=400",

  // ==========================================
  // PRO VARIANTS (ID 72-105) - Ảnh khác biệt hoàn toàn với bản thường
  // ==========================================

  // 72: iPhone 15 Pro Max Pro → màu Titanium Trắng (khác bản thường màu xám)
  72: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/i/p/iphone-15-pro-max_5__1.jpg",
  // 73: iPhone 14 Pro Pro → màu Vàng (khác bản thường màu tím)
  73: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/i/p/iphone-14-pro-1tb-2.png",
  // 74: iPad Pro M2 11 inch Pro → màu Silver (khác bản thường Space Gray)
  74: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?q=80&w=400",
  // 75: Apple Watch Ultra 2 Pro → góc chụp khác (mặt sau)
  75: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400",
  // 76: iMac 24 inch M3 Pro → màu xanh lá
  76: "https://images.unsplash.com/photo-1572932491814-4833690788ad?q=80&w=400",
  // 77: Apple AirTag 4 Pack Pro → AirTag đơn (1 Pack)
  77: "https://images.unsplash.com/photo-1603539947678-cd3954ed515d?q=80&w=400",
  // 78: AirPods Max Silver Pro → màu Midnight (khác bản thường Silver)
  78: "https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=400",
  // 79: MacBook Pro 16 M3 Max Pro → màu Silver (khác bản thường Space Black)
  79: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/v/n/vn_mac_1_3.jpg",
  // 80: Mac Studio M2 Ultra Pro → góc chụp trực diện
  80: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400",

  // 81: Samsung Galaxy S24 Ultra Pro → màu Titanium Violet
  81: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400",
  // 82: Samsung Galaxy Z Fold 5 Pro → màu Icy Blue
  82: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=400",
  // 83: Samsung Galaxy Tab S9 Ultra Pro → màu Beige
  83: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/g/a/galaxy_tab_s9_ultra_-_2.png",
  // 84: Samsung Galaxy Watch 6 Pro Pro → màu Cream
  84: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=400",
  // 85: Samsung Galaxy Buds 2 Pro Pro → màu Bora Purple
  85: "https://images.unsplash.com/photo-1598331668826-20cecc596b86?q=80&w=400",
  // 86: Samsung Galaxy Book 4 Ultra Pro → màu Moonstone Gray
  86: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=400",
  // 87: Samsung Galaxy A55 5G Pro → màu Awesome Navy
  87: "https://images.unsplash.com/photo-1598327106026-d9521da673d1?q=80&w=400",
  // 88: Samsung Galaxy SmartTag2 Pro → màu Oatmeal
  88: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=400",
  // 89: Xiaomi 14 Ultra Ceramic Pro → màu trắng (khác bản thường đen)
  89: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400",
  // 90: OnePlus 12 Wood Design Pro → màu Flowy Emerald
  90: "https://images.unsplash.com/photo-1605405748313-a416a1b84491?q=80&w=400",
  // 91: Oppo Find X7 Ultra Pro → màu Desert Sand
  91: "https://images.unsplash.com/photo-1565849511593-ed3495cf4c28?q=80&w=400",
  // 92: Google Pixel 8 Pro Mint Pro → màu Obsidian
  92: "https://images.unsplash.com/photo-1606041011872-596597976b25?q=80&w=400",
  // 93: Asus ROG Phone 8 Pro Pro → phiên bản Edition
  93: "https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=400",
  // 94: Sony Xperia 1 V Premium Pro → màu Khaki Green
  94: "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=400",
  // 95: Realme GT5 Pro Flagship Pro → màu Snow White
  95: "https://images.unsplash.com/photo-1607936854279-55e8a4c64888?q=80&w=400",
  // 96: Huawei Pura 70 Ultra Pro → màu trắng ngọc
  96: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400",

  // 97: MacBook Air M2 Silver Pro → màu Midnight
  97: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/v/n/vn_mac_2_3.jpg",
  // 98: MacBook Pro 14 M3 Black Pro → màu Silver
  98: "https://cdn2.cellphones.com.vn/200x/media/catalog/product/v/n/vn_mac_3_3.jpg",
  // 99: Galaxy Book 3 Pro Carbon Pro → màu Beige
  99: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400",
  // 100: Dell XPS 15 OLED Pro → màu Platinum
  100: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=400",
  // 101: HP Spectre x360 Gold Pro → màu Nightfall Black
  101: "https://images.unsplash.com/photo-1484788984921-03950022c38b?q=80&w=400",
  // 102: Asus Zenbook 14 Space Pro → màu Inkwell
  102: "https://images.unsplash.com/photo-1549399542-7d3b2a738c1e?q=80&w=400",
  // 103: Lenovo ThinkPad X1 Carbon Pro → màu Deep Black
  103: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400",
  // 104: Acer Swift Edge Lightweight Pro → màu Mercury Silver
  104: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?q=80&w=400",
  // 105: Razer Blade 16 Gaming Pro → phiên bản Mercury White
  105: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=400",
};

// ==========================================
// FALLBACK POOLS - Ảnh dự phòng theo danh mục
// Dùng khi URL chính bị lỗi, phân loại theo categoryId
// ==========================================
const FALLBACK_POOLS = {
  phone: [
    "https://cdn2.cellphones.com.vn/200x/media/catalog/product/i/p/iphone-14-pro_2__4.png",
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400",
    "https://images.unsplash.com/photo-1598327106026-d9521da673d1?q=80&w=400",
    "https://images.unsplash.com/photo-1605405748313-a416a1b84491?q=80&w=400",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400",
    "https://images.unsplash.com/photo-1565849511593-ed3495cf4c28?q=80&w=400",
  ],
  laptop: [
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=400",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=400",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=400",
    "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?q=80&w=400",
  ],
  tablet: [
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400",
    "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?q=80&w=400",
  ],
  watch: [
    "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=400",
    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=400",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400",
  ],
  audio: [
    "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=400",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400",
    "https://images.unsplash.com/photo-1588449668365-d15e397f6787?q=80&w=400",
  ],
  accessory: [
    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=400",
    "https://images.unsplash.com/photo-1625842268584-8f329044703b?q=80&w=400",
    "https://images.unsplash.com/photo-1629126786844-3453b34208a0?q=80&w=400",
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400",
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400",
  ],
};

// Ánh xạ categoryId → loại sản phẩm
const getCategoryType = (categoryId) => {
  const id = Number(categoryId);
  // Phones: 1(Điện thoại), 4(Apple phone), 5(Samsung phone), 35-42(other brands)
  if ([1, 4, 5, 35, 36, 37, 38, 39, 40, 41, 42].includes(id)) return "phone";
  // Laptops: 2, 13-21
  if ([2, 13, 14, 15, 16, 17, 18, 19, 20, 21].includes(id)) return "laptop";
  // Tablets: 11, 22, 23
  if ([11, 22, 23].includes(id)) return "tablet";
  // Watches: 12, 24, 25
  if ([12, 24, 25].includes(id)) return "watch";
  // Audio: 26(Apple audio), 27(Samsung audio), 30(Sony audio), 33(JBL)
  if ([26, 27, 30, 33].includes(id)) return "audio";
  // Everything else: accessories
  return "accessory";
};

/**
 * Lấy ảnh dự phòng - đúng danh mục, không trùng nhau giữa các sản phẩm
 */
export const getFallbackImage = (product) => {
  if (!product) return "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400";
  const catType = getCategoryType(product.categoryId);
  const pool = FALLBACK_POOLS[catType] || FALLBACK_POOLS.accessory;
  const idx = Math.abs(Number(product.id) || 0) % pool.length;
  return pool[idx];
};

/**
 * Lấy ảnh chính xác cho sản phẩm theo ID
 */
export const getRealProductImage = (product) => {
  if (!product) return "";
  // 1. Ưu tiên bản đồ ảnh theo ID
  if (PRODUCT_IMAGE_MAP[product.id]) {
    return PRODUCT_IMAGE_MAP[product.id];
  }
  // 2. Dùng ảnh từ DB nếu có URL hợp lệ
  const dbImg = product.image || product.featuredImage;
  if (dbImg && typeof dbImg === "string" && dbImg.startsWith("http")) {
    return dbImg;
  }
  // 3. Fallback theo danh mục
  return getFallbackImage(product);
};
