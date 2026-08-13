package com.phong.it.entity;

import java.math.BigDecimal;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.validation.constraints.NotNull;
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

@Entity
@Table(name = "products")
public class Product extends PanacheEntityBase{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Column(unique = true, nullable = false)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private String brand;

    @NotNull(message = "Giá không được để trống")
    private BigDecimal price; 

    @Column(name = "featured_image")
    private String featuredImage;

    // -- Relationships --

    // relationship with Category (N-1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // relationship with ProductVariant (1-N)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ProductVariant> variants;

    // relationship with ProductImage (1-N)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ProductImage> images;

    // relationship with Review (1-N)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private java.util.List<Review> reviews;

    // relationship with Wishlist (1-N)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private java.util.List<Wishlist> wishlists;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'SELLING'", nullable = false)
    private String status = "SELLING";

    // --- Generated Getters, Setters, and Constructors ---

    public Product() {}

    public Product(Long id, String name, String slug, String summary, String content, String brand, BigDecimal price, String featuredImage, Category category, java.util.List<ProductVariant> variants, java.util.List<ProductImage> images, java.util.List<Review> reviews, java.util.List<Wishlist> wishlists, Supplier supplier) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.summary = summary;
        this.content = content;
        this.brand = brand;
        this.price = price;
        this.featuredImage = featuredImage;
        this.category = category;
        this.variants = variants;
        this.images = images;
        this.reviews = reviews;
        this.wishlists = wishlists;
        this.supplier = supplier;
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

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getFeaturedImage() {
        return featuredImage;
    }

    public void setFeaturedImage(String featuredImage) {
        this.featuredImage = featuredImage;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public java.util.List<ProductVariant> getVariants() {
        return variants;
    }

    public void setVariants(java.util.List<ProductVariant> variants) {
        this.variants = variants;
    }

    public java.util.List<ProductImage> getImages() {
        return images;
    }

    public void setImages(java.util.List<ProductImage> images) {
        this.images = images;
    }

    public java.util.List<Review> getReviews() {
        return reviews;
    }

    public void setReviews(java.util.List<Review> reviews) {
        this.reviews = reviews;
    }

    public java.util.List<Wishlist> getWishlists() {
        return wishlists;
    }

    public void setWishlists(java.util.List<Wishlist> wishlists) {
        this.wishlists = wishlists;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

}
