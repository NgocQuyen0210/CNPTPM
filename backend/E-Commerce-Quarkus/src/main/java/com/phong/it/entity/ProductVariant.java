package com.phong.it.entity;

import java.math.BigDecimal;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
  

@Entity
@Table(name = "product_variants")
public class ProductVariant extends PanacheEntityBase{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên biến thể không được để trống")
    private String name;

    @NotBlank(message = "SKU không được để trống")
    @Column(unique = true, nullable = false)
    private String sku; 

    @NotNull(message = "Giá không được để trống")
    private BigDecimal price; 

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0; 

    // relationship with Product (N-1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // relationship with CartItem (1-N)
    @OneToMany(mappedBy = "variant")
    private List<CartItem> cartItems;

    // relationship with OrderItem (1-N)
    @OneToMany(mappedBy = "variant")
    private List<OrderItem> orderItems;

    // relationship with StockMovement (1-N)
    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL)
    private List<StockMovement> stockMovements;

    // --- Generated Getters, Setters, and Constructors ---

    public ProductVariant() {}

    public ProductVariant(Long id, String name, String sku, BigDecimal price, Integer stockQuantity, Product product, List<CartItem> cartItems, List<OrderItem> orderItems, List<StockMovement> stockMovements) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.product = product;
        this.cartItems = cartItems;
        this.orderItems = orderItems;
        this.stockMovements = stockMovements;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public List<CartItem> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItem> cartItems) {
        this.cartItems = cartItems;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public List<StockMovement> getStockMovements() {
        return stockMovements;
    }

    public void setStockMovements(List<StockMovement> stockMovements) {
        this.stockMovements = stockMovements;
    }

}