# 🛍️ Nền tảng E-Commerce Microservices & AI Chatbot Tư vấn mua sắm

Nền tảng thương mại điện tử phân tán (Microservices Architecture) được phát triển bằng **Java Quarkus** cho Backend và **ReactJS (Vite)** cho Frontend, tích hợp **AI Chatbot** tư vấn bán hàng thông minh. Dự án được tích hợp toàn bộ nghiệp vụ quản lý bán hàng, đặt hàng, quản lý kho, thanh toán, và quản trị admin trong một kiến trúc microservices khép kín.

---

## 📐 Mô tả Hệ thống & Kiến trúc (System Description & Architecture)

Hệ thống được thiết kế theo mô hình **Kiến trúc Vi dịch vụ (Microservices Architecture)** nhằm giải quyết các giới hạn của kiến trúc nguyên khối (Monolith) về tính mở rộng độc lập, khả năng chịu lỗi và tính độc lập công nghệ giữa các module nghiệp vụ.

```mermaid
graph TD
    User([Khách hàng / Admin]) -->|Truy cập HTTP| Frontend[ReactJS Frontend - Port: 5173]
    Frontend -->|Gọi REST API| Gateway[API Gateway - Port: 9000]
    
    Gateway -->|/api/auth| Auth[Auth Service - Port: 9001]
    Gateway -->|/api/products| Product[Product Service - Port: 9002]
    Gateway -->|/api/orders| Order[Order Service - Port: 9003]
    Gateway -->|/api/payments| Payment[Payment Service - Port: 9004]
    Gateway -->|/api/ai| AI[AI Service - Port: 9005]

    Auth -->|Đọc/Ghi| DB_Auth[(MySQL: auth_db)]
    Product -->|Đọc/Ghi| DB_Prod[(MySQL: product_db)]
    Order -->|Đọc/Ghi| DB_Order[(MySQL: order_db)]
    Payment -->|Đọc/Ghi| DB_Pay[(MySQL: payment_db)]
    
    Order -.->|Gọi REST Client| Product
    AI -.->|Kết nối API| Gemini[Gemini AI Engine]
```

### 1. Nguyên lý hoạt động của các thành phần chính:
* **API Gateway (Cổng API):** Đóng vai trò là điểm đầu mối duy nhất nhận tất cả các yêu cầu từ phía Frontend. API Gateway thực hiện điều hướng các yêu cầu (Routing) đến các vi dịch vụ tương ứng ở backend dựa trên tiền tố đường dẫn (ví dụ: `/api/auth` sang `auth-service`, `/api/products` sang `product-service`).
* **Cơ sở dữ liệu độc lập (Database per Service):** Mỗi Microservice sở hữu một cơ sở dữ liệu riêng độc lập (`auth_db`, `product_db`, `order_db`, `payment_db`). Điều này đảm bảo tính đóng gói dữ liệu, tránh sự phụ thuộc chéo về dữ liệu giữa các dịch vụ và cho phép từng dịch vụ có thể mở rộng cơ sở dữ liệu tùy biến.
* **Giao tiếp liên dịch vụ (Inter-service Communication):** Các microservice giao tiếp với nhau bằng phương thức gọi đồng bộ qua REST Client (sử dụng Quarkus MicroProfile REST Client). Ví dụ, khi `order-service` cần xác thực tồn kho trước khi đặt hàng, nó sẽ tự động gửi yêu cầu gọi API sang `product-service` để kiểm tra số lượng hiện tại.
* **Bảo mật phân tán với JWT (Token-based Security):** Khi người dùng đăng nhập thành công tại `auth-service`, hệ thống sẽ trả về một khóa mã hóa **JWT Token** chứa quyền hạn và định danh người dùng. Khi gửi yêu cầu qua API Gateway đến các service khác, token này sẽ được đính kèm ở Header. Mỗi service sẽ tự giải mã và kiểm tra quyền hạn nội bộ thông qua thư viện SmallRye JWT độc lập mà không cần phải truy vấn lại dịch vụ Auth.

---

## 🌟 Danh sách Chức năng hệ thống (System Features)

### 👤 1. Phân hệ dành cho Khách hàng (User Dashboard)
* **Trang chủ & Menu sản phẩm:**
  * Bộ lọc sản phẩm theo Danh mục và Thương hiệu.
  * Ô tìm kiếm thông minh tích hợp **Gợi ý tự động (Autocomplete Search Suggestions)** khi nhập ký tự.
  * Hiển thị danh sách sản phẩm nổi bật cùng huy hiệu trạng thái kho hàng.
* **Chi tiết sản phẩm:**
  * Xem mô tả chi tiết, hình ảnh sản phẩm.
  * Chọn lựa linh hoạt các cấu hình biến thể (RAM, SSD, Màu sắc, Dung lượng, Kích cỡ...).
  * Tự động kiểm tra số lượng tồn kho của cấu hình đã chọn.
  * Tính năng **Đặt hàng trước (Pre-order)** nếu biến thể sản phẩm tạm thời hết hàng trong kho.
* **Quản lý Giỏ hàng (Cart):**
  * Thêm sản phẩm nhanh hoặc thêm từ trang chi tiết kèm theo biến thể đã chọn.
  * Cập nhật tăng/giảm số lượng trực tiếp trong giỏ hàng hoặc xóa sản phẩm.
  * Áp dụng mã giảm giá (Coupon) để chiết khấu trực tiếp vào tổng tiền.
* **Thanh toán đơn hàng (Checkout):**
  * Chọn địa chỉ nhận hàng đã lưu hoặc thêm địa chỉ giao hàng mới.
  * Hỗ trợ nhiều phương thức thanh toán: COD (Thanh toán khi nhận hàng), Chuyển khoản ngân hàng kèm **mã QR Payment tự động**, hoặc thanh toán điện tử.
  * Kiểm tra chặt chẽ số lượng tồn kho thời gian thực tại thời điểm đặt hàng.
* **Lịch sử mua hàng (Order History):**
  * Xem danh sách các đơn hàng đã đặt kèm trạng thái chi tiết.
  * Theo dõi quy trình trạng thái đơn hàng: *PENDING (Chờ xử lý)* $\rightarrow$ *PROCESSING (Đang chuẩn bị)* $\rightarrow$ *SHIPPED (Đang giao)* $\rightarrow$ *DELIVERED (Đã giao)* $\rightarrow$ *COMPLETED (Hoàn thành)*.
* **Danh sách yêu thích (Wishlist):**
  * Lưu trữ các sản phẩm yêu thích cá nhân để dễ dàng mua lại sau này.
* **Quản lý thông tin cá nhân (Profile):**
  * Cập nhật trực tiếp **Họ tên**, **Email** và **Mật khẩu mới** xuống cơ sở dữ liệu MySQL.
  * Tự động đồng bộ và thay đổi tên chào mừng trên thanh Header ngay lập tức (không cần tải lại trang).
* **AI Chatbot tư vấn thông minh:**
  * Cửa sổ chat tư vấn nằm ở góc màn hình kết nối trực tiếp với **Gemini AI API**.
  * Tư vấn sản phẩm phù hợp dựa trên mô tả nhu cầu của khách hàng (Ví dụ: *"Tôi muốn mua laptop chơi game tầm 30 triệu"*).

---

### 🔑 2. Phân hệ dành cho Quản trị viên (Admin Portal)
* **Bảng điều khiển thống kê (Dashboard):**
  * Biểu đồ doanh thu trực quan, thống kê số lượng Đơn hàng, Sản phẩm, Khách hàng.
  * Danh sách hiển thị các đơn hàng mới nhất cần phê duyệt trạng thái.
* **Quản lý Danh mục (Category CRUD):**
  * Tạo mới danh mục, tự động tạo slug chuẩn SEO.
  * Chỉnh sửa thông tin hoặc xóa danh mục.
* **Quản lý Sản phẩm (Product CRUD):**
  * Thêm mới sản phẩm kèm các thông tin cơ bản: Thương hiệu, giá gốc, ảnh đại diện, danh mục, nhà cung cấp.
  * **Thiết lập mặc định tồn kho:** Tự động tạo cấu hình biến thể mặc định với số lượng tồn kho ban đầu (mặc định sẵn là `100` sản phẩm) giúp tối ưu hóa luồng tạo sản phẩm.
  * Hiển thị chi tiết số lượng của tất cả cấu hình sản phẩm trực tiếp ngoài danh sách.
* **Quản lý Biến thể (Variant Management):**
  * Thêm mới, chỉnh sửa giá, mã SKU và số lượng hàng tồn kho cho từng cấu hình biến thể cụ thể của sản phẩm.
* **Quản lý Người dùng (User Management):**
  * Xem danh sách tất cả các tài khoản đăng ký trong hệ thống.
  * Phân quyền linh hoạt cho tài khoản người dùng (`USER`, `ADMIN`).

---

## 📂 Kiến trúc thư mục dự án

```text
CNPTPM/
├── backend/                  # Mã nguồn các dịch vụ Backend
│   ├── common-module/        # Chứa DTO, Entity và Exception dùng chung cho các service
│   ├── api-gateway/          # Cổng giao tiếp chung (Port: 9000) điều hướng API
│   ├── auth-service/         # Quản lý người dùng, phân quyền, token (Port: 9001)
│   ├── product-service/      # Quản lý sản phẩm, danh mục, kho hàng (Port: 9002)
│   ├── order-service/        # Xử lý giỏ hàng, đơn hàng, trạng thái (Port: 9003)
│   ├── payment-service/      # Quản lý giao dịch, thanh toán qua VNPay/mã QR (Port: 9004)
│   └── ai-service/           # Dịch vụ tích hợp AI tư vấn bán hàng (Port: 9005)
├── frontend/                 # Mã nguồn giao diện người dùng (Port: 5173)
├── start-all.ps1             # Script khởi động toàn bộ dự án nhanh trên Windows (PowerShell)
├── start.bat                 # Script chạy nhanh dự án bằng Double-click (Batch file)
└── README.md                 # Tài liệu hướng dẫn dự án
```

---

## 💻 Yêu cầu hệ thống (Prerequisites)

Trước khi chạy dự án, hãy đảm bảo máy tính của bạn đã được cài đặt sẵn:
1. **Java Development Kit (JDK):** Phiên bản **21** trở lên.
2. **Node.js:** Phiên bản **18** trở lên (kèm `npm`).
3. **MySQL Server 8.0+:** Đang hoạt động trên cổng `3306` với cấu hình tài khoản mặc định:
   * **Username:** `root`
   * **Password:** `Quyen@2005`

---

## 💾 Thiết lập Cơ sở dữ liệu

Hãy mở MySQL Workbench (hoặc DBeaver, phpMyAdmin) và tạo trước 4 Database trống sau đây:
```sql
CREATE DATABASE auth_db;
CREATE DATABASE product_db;
CREATE DATABASE order_db;
CREATE DATABASE payment_db;
```

> [!NOTE]
> Khi khởi chạy lần đầu tiên, hệ thống sẽ tự động cấu trúc bảng và tải dữ liệu mẫu (sản phẩm, tài khoản mặc định) từ các tệp tin `import.sql` tương ứng vào cơ sở dữ liệu.

---

## 🚀 Hướng dẫn khởi chạy dự án nhanh

### Cách 1: Sử dụng Batch file (Nhanh nhất)
1. Truy cập thư mục gốc của dự án.
2. Double-click vào tệp tin **`start.bat`**. 
3. Lệnh sẽ tự động mở các cửa sổ PowerShell tương ứng để chạy các dịch vụ Backend và Frontend.

### Cách 2: Sử dụng Script PowerShell
Mở PowerShell tại thư mục gốc của dự án và chạy:
```powershell
./start-all.ps1
```

---

## 📍 Bản đồ Cổng Dịch vụ (Ports Map)

| Dịch vụ | Cổng | URL truy cập |
| :--- | :--- | :--- |
| **API Gateway** | `9000` | `http://localhost:9000` |
| **Auth Service** | `9001` | `http://localhost:9001` |
| **Product Service**| `9002` | `http://localhost:9002` |
| **Order Service** | `9003` | `http://localhost:9003` |
| **Payment Service**| `9004` | `http://localhost:9004` |
| **AI Service** | `9005` | `http://localhost:9005` |
| **Frontend Web** | `5173` | `http://localhost:5173` |
| **MySQL Server** | `3306` | `localhost:3306` |

---

## 👤 Tài khoản thử nghiệm mặc định

* **Tài khoản quản trị viên (Admin):**
  * **Tên đăng nhập:** `admin` (hoặc `admin@gmail.com`)
  * **Mật khẩu:** `123456`
* **Tài khoản khách hàng (User):**
  * **Tên đăng nhập:** `nguyenvana`
  * **Mật khẩu:** `123456`

---

## ⚙️ Luồng nghiệp vụ kho hàng nâng cao (Stock Business Logic)
* **Kiểm tra kho lúc Checkout:** Khi khách hàng tiến hành thanh toán, hệ thống sẽ gọi chéo REST Client sang `product-service` để kiểm tra tồn kho tức thời. Nếu vượt quá tồn kho, hệ thống sẽ ngăn chặn việc tạo đơn hàng và hiển thị chính xác tên sản phẩm bị thiếu hàng.
* **Thời điểm trừ tồn kho:** Thay vì trừ hàng ngay khi đặt đơn, hệ thống chỉ kích hoạt trừ số lượng tồn kho khi Admin phê duyệt trạng thái đơn hàng sang **`DELIVERED`** hoặc **`COMPLETED`** (Đã giao hàng thành công).
* **Hoàn trả kho hàng:** Nếu đơn hàng sau khi giao thành công bị khách hàng đổi trả hoặc hoàn hàng (**`RETURNED`**), hệ thống tự động sinh phiếu điều chuyển kho dạng `RETURN` để cộng hoàn lại số lượng sản phẩm vào kho.

---
Chúc bạn có buổi báo cáo và phát triển dự án thành công tốt đẹp! 🎉
