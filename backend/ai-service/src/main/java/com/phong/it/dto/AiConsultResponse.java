package com.phong.it.dto;

import com.phong.it.dto.response.ProductResponseDTO;
import java.util.List;

public class AiConsultResponse {
    private String messageText;
    private List<ProductResponseDTO> products;

    public AiConsultResponse() {}

    public AiConsultResponse(String messageText, List<ProductResponseDTO> products) {
        this.messageText = messageText;
        this.products = products;
    }

    public String getMessageText() {
        return messageText;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
    }

    public List<ProductResponseDTO> getProducts() {
        return products;
    }

    public void setProducts(List<ProductResponseDTO> products) {
        this.products = products;
    }
}
