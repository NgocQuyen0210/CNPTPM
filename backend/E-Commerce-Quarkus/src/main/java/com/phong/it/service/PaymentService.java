package com.phong.it.service;

import java.util.Map;

import com.phong.it.dto.request.PaymentRequestDTO;
import com.phong.it.entity.Payment;

public interface PaymentService {
   
    String createPayment(PaymentRequestDTO request, String ipAddress);

    Payment processReturn(Map<String, String> queryParams);
}
