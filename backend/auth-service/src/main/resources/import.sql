-- Master Data for Auth Service
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
(1, 'ADMIN', 'Quản trị viên hệ thống', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'USER', 'Người dùng thông thường', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, email, password, full_name, created_at, updated_at) VALUES
(1, 'admin', 'admin@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Quản Trị Viên', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'nguyenvana', 'vana@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'tranthib', 'thib@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Trần Thị B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'nguyenvanb', 'vanb@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'nguyenvanc', 'vanc@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn C', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'nguyenvand', 'vand@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn D', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'nguyenvane', 'vane@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn E', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'nguyenvanf', 'vanf@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn F', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'nguyenvang', 'vang@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn G', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'nguyenvanh', 'vanh@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn H', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 'nguyenvani', 'vani@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 'nguyenvanj', 'vanj@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn J', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 'nguyenvank', 'vank@gmail.com', '$2a$10$YTqAQmCU/FNMVLhwRqMm2uPMQtdbvEbtHhrlWWplbi0Gb27aLtPRm', 'Nguyễn Văn K', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users_roles (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 2),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2),
(9, 2),
(10, 2),
(11, 2),
(12, 2),
(13, 2);

INSERT INTO addresses (id, full_name, phone_number, province, district, ward, detail_address, is_default, user_id) VALUES
(1, 'Nguyễn Văn A', '0987654321', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 10 Ngõ 2', true, 2),
(2, 'Trần Thị B', '0912345678', 'TP HCM', 'Quận 3', 'Phường 5', '123 Đường Nam Kỳ Khởi Nghĩa', true, 3);
