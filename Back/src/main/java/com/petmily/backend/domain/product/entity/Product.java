package com.petmily.backend.domain.product.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.order.entity.OrderItem;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder(toBuilder = true)
public class Product extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull
    @Positive
    private Double price;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "brand")
    private String brand;
    
    @Column(name = "weight")
    private Double weight;
    
    @Column(name = "dimensions")
    private String dimensions;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "discount_rate")
    @Builder.Default
    private Double discountRate = 0.0;
    
    @Column(name = "rating_average")
    @Builder.Default
    private Double ratingAverage = 0.0;
    
    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "sale_count")
    @Builder.Default
    private Integer saleCount = 0;

    @Column(name = "sales_count")
    @Builder.Default
    private Integer salesCount = 0;

    @NotNull
    @Column(name = "stock")
    @Builder.Default
    private Integer stock = 0;

    @Column(name = "is_free_shipping")
    @Builder.Default
    private Boolean isFreeShipping = false;

    @Column(name = "pet_type")
    private String petType;

    @Column(name = "pet_size")
    private String petSize;

    @Column(name = "pet_age")
    private String petAge;

    @Column(name = "material")
    private String material;

    @Column(name = "features")
    private String features;

    @Column(name = "origin")
    private String origin;

    @NotNull
    @Column(name = "category_id")
    private Long categoryId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();
    
    public void updateProduct(String name, String description, Double price, String imageUrl,
                             String brand, Double weight, String dimensions, Integer stock,
                             Long categoryId, Double discountRate, Boolean isActive) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.brand = brand;
        this.weight = weight;
        this.dimensions = dimensions;
        this.stock = stock;
        this.categoryId = categoryId;
        this.discountRate = discountRate;
        this.isActive = isActive;
    }
    
    public void deactivate() {
        this.isActive = false;
    }
    
    public void decreaseStock(Integer quantity) {
        if (this.stock < quantity) {
            throw new IllegalArgumentException("재고가 부족합니다.");
        }
        this.stock -= quantity;
    }
    
    public void increaseStock(Integer quantity) {
        this.stock += quantity;
    }
    
    public void updateRating(Double ratingAverage, Integer reviewCount) {
        this.ratingAverage = ratingAverage;
        this.reviewCount = reviewCount;
    }
    
    public boolean isActive() {
        return this.isActive != null && this.isActive;
    }

}

