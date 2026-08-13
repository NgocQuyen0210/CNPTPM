package com.phong.it.service.impl;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.stream.Collectors;

import com.phong.it.dto.request.PaymentRequestDTO;
import com.phong.it.entity.Payment;
import com.phong.it.entity.PaymentStatus;
import com.phong.it.util.VNPayUtil;

import com.phong.it.entity.Order;
import com.phong.it.service.PaymentService;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PaymentServiceImpl implements PaymentService {
    // Nạp các thông số từ cấu hình application.properties vào tầng triển khai
    @ConfigProperty(name = "vnpay.tmn-code")
    String tmnCode;
    @ConfigProperty(name = "vnpay.hash-secret")
    String hashSecret;
    @ConfigProperty(name = "vnpay.pay-url")
    String vnpPayUrl;
    @ConfigProperty(name = "vnpay.return-url")
    String returnUrl;
    @ConfigProperty(name = "vnpay.version")
    String vnpVersion;
    @ConfigProperty(name = "vnpay.command")
    String vnpCommand;

    @Override
    @Transactional // 💡 Bắt buộc phải có để Hibernate thực hiện việc lưu (Insert) dữ liệu vào
                   // PostgreSQL
    public String createPayment(PaymentRequestDTO request, String ipAddress) {

        // 1. Sinh mã giao dịch nội bộ duy nhất dựa trên thời gian (mili giây) tránh
        // trùng lặp
        String vnpTxnRef = String.valueOf(System.currentTimeMillis());

        // 2. Tìm kiếm thông tin đơn hàng gốc trong hệ thống qua Hibernate Panache
        Order order = Order.findById(request.orderId());
        if (order == null) {
            throw new IllegalArgumentException("Không tìm thấy thông tin đơn hàng có ID: " + request.orderId());
        }

        // 3. Kiểm tra xem đơn hàng này đã từng có bản ghi thanh toán nào trong bảng payments chưa
        Payment payment = Payment.find("order", order).firstResult();
        
        if (payment == null) {
            payment = new Payment();
            payment.setOrder(order);
        } else {
            // Kiểm tra Idempotency: nếu đã thanh toán thành công thì không cho tạo lại
            if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                throw new IllegalArgumentException("Đơn hàng này đã được thanh toán thành công!");
            }
        }

        // 4. Gán/cập nhật lại các thông tin mới nhất cho phiên giao dịch
        payment.setAmount(request.amount());
        payment.setTransactionId(vnpTxnRef);
        payment.setPaymentInfo(request.paymentInfo());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        
        payment.persist(); // Đẩy dữ liệu xuống PostgreSQL (hoặc cập nhật nếu đã tồn tại)

        // 4. Quy đổi số tiền: VNPay quy định số tiền gửi đi phải nhân với 100 để loại
        // bỏ số thập phân
        long amount = request.amount().longValue() * 100;

        // 5. Đóng gói danh sách các tham số gửi sang cổng thanh toán theo đúng tài liệu
        // VNPay
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnpVersion);
        vnpParams.put("vnp_Command", vnpCommand);
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", request.paymentInfo());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_IpAddr", ipAddress);

        // Định dạng thời gian tạo link giao dịch và thời gian hết hạn (sau 15 phút)
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15);
        vnpParams.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        // 6. Xây dựng chuỗi Query String thô (Chuỗi này bắt buộc sắp xếp thứ tự các key
        // từ A-Z)
        String queryUrl = vnpParams.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .sorted(Map.Entry.comparingByKey()) // Sắp xếp theo bảng chữ cái
                .map(entry -> entry.getKey() + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII))
                .collect(Collectors.joining("&"));

        // 7. Tạo mã băm bảo mật (Checksum) dựa trên chuỗi tham số đã sắp xếp và secret
        // key
        String vnpSecureHash = VNPayUtil.hashAllFields(vnpParams, hashSecret);

        // 8. Đính kèm mã băm vào cuối chuỗi truy vấn để VNPay thực hiện đối soát tính
        // toàn vẹn dữ liệu
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;

        // Trả về đường dẫn hoàn chỉnh cho API Controller để gửi về cho client
        return vnpPayUrl + "?" + queryUrl;
    }

    @Override
    @Transactional // 💡 Quản lý giao dịch để đảm bảo việc cập nhật trạng thái (Update) DB diễn ra
                   // đồng bộ
    public Payment processReturn(Map<String, String> queryParams) {

        // 1. Tách chuỗi mã băm mà VNPay gửi về ra khỏi bộ tham số để tiến hành tự tính
        // toán lại
        String vnpSecureHash = queryParams.remove("vnp_SecureHash");
        queryParams.remove("vnp_SecureHashType"); // Loại bỏ tham số định dạng mã băm nếu có

        // 2. Hệ thống tự băm lại tập hợp các tham số nhận về bằng thuật toán HMAC
        // SHA-512 nội bộ
        String signValue = VNPayUtil.hashAllFields(queryParams, hashSecret);

        // 3. Trích xuất mã giao dịch nội bộ từ URL để tìm kiếm bản ghi tương ứng trong
        // PostgreSQL
        String vnpTxnRef = queryParams.get("vnp_TxnRef");
        Payment payment = Payment.find("transactionId", vnpTxnRef)
                                 .withLock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
                                 .firstResult();

        if (payment == null) {
            throw new IllegalArgumentException("Không tìm thấy lịch sử giao dịch mã: " + vnpTxnRef);
        }

        // Xử lý Idempotency - Tránh cập nhật 2 lần nếu VNPay gọi webhook nhiều lần
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS || payment.getPaymentStatus() == PaymentStatus.FAILED) {
            // Nếu giao dịch đã được xử lý trước đó rồi thì bỏ qua, trả về luôn
            return payment;
        }

        // 4. KIỂM TRA TÍNH TOÀN VẸN: So sánh mã băm tự tính (signValue) với mã băm
        // VNPay gửi về (vnpSecureHash)
        if (signValue.equals(vnpSecureHash)) {
            
            // KIỂM TRA SỐ TIỀN (Amount Validation)
            long vnpAmount = Long.parseLong(queryParams.get("vnp_Amount")) / 100;
            if (payment.getAmount().longValue() != vnpAmount) {
                // Nếu gọi từ IPN, quy định trả về mã lỗi 04 (Invalid amount)
                throw new IllegalArgumentException("Số tiền thanh toán không khớp!");
            }

            // Lấy mã phản hồi kết quả giao dịch (Mã "00" đại diện cho giao dịch thành công)
            String responseCode = queryParams.get("vnp_ResponseCode");

            // Lưu lại các thông tin đối soát bổ sung do VNPay cung cấp
            payment.setVnpTransactionNo(queryParams.get("vnp_TransactionNo"));
            payment.setBankCode(queryParams.get("vnp_BankCode"));
            payment.setVnpResponseCode(responseCode);

            if ("00".equals(responseCode)) {
                // Giao dịch thành công thực tế, chuyển trạng thái từ PENDING thành SUCCESS
                payment.setPaymentStatus(PaymentStatus.SUCCESS);
                
                // ĐỒNG BỘ TRẠNG THÁI ORDER
                Order order = payment.getOrder();
                if(order != null) {
                    order.setStatus(com.phong.it.entity.OrderStatus.PROCESSING); // Chuyển sang chờ xử lý/giao hàng
                    order.persist();
                }
            } else {
                // Giao dịch bị lỗi, thất bại hoặc người dùng chủ động hủy trên trang VNPay
                payment.setPaymentStatus(PaymentStatus.FAILED);
            }
        } else {
            // Chữ ký không khớp, chứng tỏ dữ liệu URL đã bị can thiệp trái phép, đổi sang
            // trạng thái FAILED
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setPaymentInfo("Giao dịch thất bại do sai chữ ký bảo mật kiểm thử (Invalid Checksum)");
        }

        // Cập nhật các trạng thái mới xuống cơ sở dữ liệu
        payment.persist();
        return payment;
    }
}
