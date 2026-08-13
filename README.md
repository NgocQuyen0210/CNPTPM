# Dự án CNPTPM (Công nghệ phần mềm)

Dự án này là hệ thống E-Commerce Microservices tích hợp AI Chatbot Tư vấn mua sắm, được gộp chung cả Backend và Frontend vào một Repository duy nhất để dễ quản lý.

## Cấu trúc thư mục

* **`backend/`**: Mã nguồn các microservices được phát triển bằng Java / Quarkus.
  * `auth-service`
  * `product-service`
  * `order-service`
  * `payment-service`
  * `api-gateway`
  * `ai-service`
* **`frontend/`**: Mã nguồn Frontend được phát triển bằng React / Vite / Tailwind CSS.

## Cách chạy dự án nhanh

Để khởi chạy toàn bộ 6 microservices backend và giao diện frontend cùng một lúc, bạn hãy mở PowerShell và chạy script sau tại thư mục gốc:

```powershell
./start-all.ps1
```
