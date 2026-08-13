# 🛒 E-commerce API

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)
![Quarkus](https://img.shields.io/badge/Quarkus-3.35.2-blue?style=for-the-badge&logo=quarkus)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![MapStruct](https://img.shields.io/badge/MapStruct-1.5.5.Final-green?style=for-the-badge)
![Hibernate](https://img.shields.io/badge/Hibernate-ORM_with_Panache-59666C?style=for-the-badge&logo=hibernate)

## 📖 Giới thiệu dự án (About the Project)

**E-commerce API** là hệ thống API backend chuẩn RESTful dành cho nền tảng thương mại điện tử. Dự án cung cấp các tính năng cốt lõi như quản lý người dùng, phân quyền, quản lý sản phẩm, giỏ hàng, và xử lý đơn hàng. Hệ thống được thiết kế với kiến trúc rõ ràng, tập trung vào hiệu năng cao và tốc độ khởi động cực nhanh nhờ sử dụng framework Quarkus.

### 🚀 Công nghệ sử dụng
Dự án được xây dựng dựa trên các công nghệ và thư viện hiện đại:
- **Java 21**
- **Quarkus 3.35.2** (Framework chính)
- **Hibernate ORM with Panache** (Tương tác với cơ sở dữ liệu theo Active Record/Repository pattern)
- **MySQL** (Hệ quản trị CSDL)
- **Quarkus REST & Jackson** (Xây dựng API & xử lý dữ liệu JSON)
- **MapStruct 1.5.5.Final** (Mapping dữ liệu tự động giữa Entity và DTO)
- **Quarkus Security & Elytron** (Bảo mật và phân quyền)
- **Hibernate Validator** (Kiểm tra tính hợp lệ của dữ liệu đầu vào)

---

## 🛠 Chuẩn bị môi trường & Cách chạy (Getting Started)

### 📋 Yêu cầu hệ thống (Prerequisites)
Để chạy dự án, máy tính của bạn cần cài đặt sẵn:
- **Java Development Kit (JDK) 21** trở lên.
- **Apache Maven** (hoặc sử dụng trực tiếp Maven Wrapper `./mvnw` có sẵn trong dự án).
- **MySQL Server** đang hoạt động.
- **IDE:** IntelliJ IDEA, Eclipse, hoặc VS Code (khuyên dùng kèm _Extension Pack for Java_).
*(Lưu ý: Dự án không sử dụng Lombok, thay vào đó sử dụng MapStruct kết hợp với Java records/classes thuần túy để tối ưu hiệu năng và mã nguồn trong sáng hơn).*

### 📥 Cài đặt (Installation)
1. **Clone mã nguồn dự án** về máy:
   ```bash
   git clone <url-kho-chua-cua-ban>
   cd e-commerce-api
   ```
2. **Cài đặt các thư viện phụ thuộc** (Dependencies):
   ```bash
   ./mvnw clean install -DskipTests
   ```

### ⚙️ Cấu hình (Configuration)
Tạo cơ sở dữ liệu MySQL cho dự án. Mở file `src/main/resources/application.properties` (hoặc `.env` nếu có cấu hình) và thiết lập thông tin kết nối Database. Ví dụ:

```properties
# Cấu hình kết nối MySQL
quarkus.datasource.db-kind=mysql
quarkus.datasource.jdbc.url=jdbc:mysql://localhost:3306/ecommerce_db
quarkus.datasource.username=root
quarkus.datasource.password=your_password

# Cấu hình Hibernate (Tự động cập nhật schema - chỉ nên dùng cho môi trường Dev)
quarkus.hibernate-orm.database.generation=update
```

### ▶️ Cách chạy (Usage)

**1. Chạy dự án ở chế độ Development (Dev Mode):**
Chế độ Dev của Quarkus hỗ trợ Live Coding cực kỳ mạnh mẽ (tự động compile và reload lại code ngay khi có thay đổi mà không cần khởi động lại server).
```bash
./mvnw compile quarkus:dev
```
*Sau khi khởi động thành công, ứng dụng sẽ lắng nghe ở địa chỉ mặc định là `http://localhost:8080`.*

**2. Build dự án (Production Mode):**
Để đóng gói ứng dụng thành file `.jar` chạy trên máy ảo Java (JVM):
```bash
./mvnw package
```
Kết quả sẽ sinh ra file `quarkus-run.jar` trong thư mục `target/quarkus-app/`. Bạn có thể chạy ứng dụng bằng lệnh:
```bash
java -jar target/quarkus-app/quarkus-run.jar
```

---
*Được phát triển với ❤️.*
