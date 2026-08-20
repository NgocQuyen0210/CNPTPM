# 🛍️ Hệ thống E-Commerce Microservices & AI Chatbot tư vấn mua sắm

Dự án này là một nền tảng thương mại điện tử phân tán (Microservices Architecture) được xây dựng bằng **Java Quarkus** ở phía Backend và **ReactJS (Vite)** ở phía Frontend, tích hợp **AI Chatbot** tư vấn bán hàng thời gian thực. Dự án được gộp chung mã nguồn vào một Repository để dễ dàng triển khai và quản lý.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Backend (Microservices)
* **Ngôn ngữ & Framework:** Java 21, Quarkus 3.35.2
* **ORM & Database Access:** Hibernate ORM Panache, JDBC MySQL Driver
* **Bảo mật & Xác thực:** SmallRye JWT (JSON Web Tokens), Elytron Security (Bcrypt)
* **Giao tiếp liên dịch vụ:** MicroProfile REST Client
* **Quản lý luồng công việc:** Maven Multi-module

### Frontend
* **Framework:** ReactJS (Vite)
* **Styling:** Custom CSS Vanilla (Thiết kế theo xu hướng Kính mờ - Glassmorphic hiện đại, tương thích hoàn toàn Responsive)
* **Icons:** React Icons (FontAwesome)

### Cơ sở dữ liệu
* **Database:** MySQL Server 8.0+ (Chạy trên cổng mặc định `3306`)

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

Để thuận tiện, hệ thống đã đi kèm các tệp lệnh khởi động hàng loạt các dịch vụ mà không cần chạy thủ công từng cái.

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

Hệ thống hoạt động đồng bộ thông qua các cổng giao thức sau:

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

Dự án đi kèm dữ liệu tài khoản mẫu được kích hoạt sẵn để chạy thử:

* **Tài khoản quản trị viên (Admin):**
  * **Tên đăng nhập:** `admin` (hoặc `admin@gmail.com`)
  * **Mật khẩu:** `123456`
* **Tài khoản khách hàng (User):**
  * **Tên đăng nhập:** `nguyenvana`
  * **Mật khẩu:** `123456`

---

## 🌟 Các chức năng đặc trưng & Nghiệp vụ cốt lõi

### 1. Trừ kho thông minh khi Giao hàng thành công
* Hệ thống sẽ kiểm tra tồn kho tại trang Checkout để đảm bảo đủ số lượng trước khi cho phép tạo đơn.
* Số lượng hàng sẽ **chưa bị trừ** ngay khi đặt hàng, mà chỉ được thực hiện khi đơn hàng chuyển sang trạng thái **`DELIVERED`** hoặc **`COMPLETED`** (Đã giao hàng thành công).
* Trường hợp đơn hàng chuyển sang **`RETURNED`** (Hoàn trả/Trả hàng), kho hàng của biến thể sản phẩm đó sẽ tự động được hoàn lại số lượng tương ứng.

### 2. Thiết lập mặc định tồn kho
* Khi tạo mới sản phẩm phía Admin, hệ thống tự động sinh cấu hình biến thể mặc định với số lượng tồn kho khởi tạo mặc định là **100 sản phẩm** (được hiển thị trực quan trong cột Số lượng kho ở danh sách sản phẩm).

### 3. Thiết lập thông tin cá nhân khách hàng
* Khách hàng có thể truy cập trang cài đặt tài khoản cá nhân tại đường dẫn `/dashboard/profile` (click vào tên chào mừng góc phải).
* Thông tin chỉnh sửa được lưu trực tiếp xuống MySQL và phát tín hiệu đồng bộ để thanh Header cập nhật trực tiếp tên mới tức thì mà không cần load lại trang.

---
 chúc bạn có buổi báo cáo và phát triển dự án thành công tốt đẹp! 🎉
