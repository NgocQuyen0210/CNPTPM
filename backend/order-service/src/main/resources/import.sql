INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount_value, start_date, end_date, usage_limit, used_count, is_active) VALUES
(1, 'SALE10', 'Giảm 10%', 'PERCENTAGE', 10, 500000, 500000, '2025-01-01 00:00:00', '2030-12-31 23:59:59', 100, 0, true),
(2, 'MINUS50K', 'Giảm 50K', 'FIXED_AMOUNT', 50000, 200000, NULL, '2025-01-01 00:00:00', '2030-12-31 23:59:59', 200, 0, true);

INSERT INTO wishlists (id, user_id, product_id, created_at) VALUES
(1, 2, 1, CURRENT_TIMESTAMP),
(2, 3, 3, CURRENT_TIMESTAMP);

-- Giao dịch (Transaction)
INSERT INTO carts (id, user_id, created_at, updated_at) VALUES
(1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO cart_items (id, quantity, cart_id, variant_id) VALUES
(1, 1, 2, 1),
(2, 2, 3, 6);

INSERT INTO orders (id, user_id, total_price, status, shipping_full_name, shipping_phone, province, district, ward, detail_address, shipping_note, coupon_id, discount_amount, payment_method, created_at) VALUES
(1, 2, 30000000, 'DELIVERED', 'Nguyễn Văn A', '0987654321', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Số 10 Ngõ 2', 'Giao giờ hành chính', NULL, 0, 'COD', CURRENT_TIMESTAMP),
(2, 3, 32000000, 'PENDING', 'Trần Thị B', '0912345678', 'Hồ Chí Minh', 'Quận 1', 'Bến Nghé', 'Tòa nhà Bitexco', NULL, NULL, 0, 'VNPAY', CURRENT_TIMESTAMP);

INSERT INTO order_items (id, order_id, variant_id, quantity, price) VALUES
(1, 1, 1, 1, 30000000),
(2, 2, 6, 1, 32000000);
