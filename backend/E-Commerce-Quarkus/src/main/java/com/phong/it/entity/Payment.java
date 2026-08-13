package com.phong.it.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "transaction_id", unique = true)
    private String transactionId; // Chính là vnp_TxnRef gửi sang VNPay

    @Column(name = "vnp_transaction_no")
    private String vnpTransactionNo; // Mã giao dịch do VNPay trả về

    private BigDecimal amount;

    @Column(name = "bank_code")
    private String bankCode; // Mã ngân hàng (ví dụ: NCB, VCB)

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "vnp_response_code")
    private String vnpResponseCode; // Mã phản hồi (00 là thành công)

    @Column(name = "payment_info")
    private String paymentInfo; // Thông tin nội dung thanh toán

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // --- Generated Getters, Setters, and Constructors ---

    public Payment() {}

    public Payment(Long id, Order order, String transactionId, String vnpTransactionNo, BigDecimal amount, String bankCode, PaymentStatus paymentStatus, String vnpResponseCode, String paymentInfo, LocalDateTime createdAt) {
        this.id = id;
        this.order = order;
        this.transactionId = transactionId;
        this.vnpTransactionNo = vnpTransactionNo;
        this.amount = amount;
        this.bankCode = bankCode;
        this.paymentStatus = paymentStatus;
        this.vnpResponseCode = vnpResponseCode;
        this.paymentInfo = paymentInfo;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getVnpTransactionNo() {
        return vnpTransactionNo;
    }

    public void setVnpTransactionNo(String vnpTransactionNo) {
        this.vnpTransactionNo = vnpTransactionNo;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getBankCode() {
        return bankCode;
    }

    public void setBankCode(String bankCode) {
        this.bankCode = bankCode;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getVnpResponseCode() {
        return vnpResponseCode;
    }

    public void setVnpResponseCode(String vnpResponseCode) {
        this.vnpResponseCode = vnpResponseCode;
    }

    public String getPaymentInfo() {
        return paymentInfo;
    }

    public void setPaymentInfo(String paymentInfo) {
        this.paymentInfo = paymentInfo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}