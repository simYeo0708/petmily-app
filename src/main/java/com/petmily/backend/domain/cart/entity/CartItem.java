package com.petmily.backend.domain.cart.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.product.entity.Product;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder(toBuilder = true)
public class CartItem extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "user_id")
    private Long userId;
    
    @NotNull
    @Column(name = "product_id")
    private Long productId;
    
    @NotNull
    @Positive
    private Integer quantity;
    
    @Column(name = "is_selected")
    @Builder.Default
    private Boolean isSelected = true;
    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;
    
    // Business methods
    public void updateQuantity(Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("수량은 1개 이상이어야 합니다.");
        }
        this.quantity = quantity;
    }
    
    public void toggleSelection() {
        this.isSelected = !this.isSelected;
    }
    
    public void select() {
        this.isSelected = true;
    }
    
    public void deselect() {
        this.isSelected = false;
    }
    
    public BigDecimal getTotalPrice() {
        if (this.product == null) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(this.product.getPrice()).multiply(BigDecimal.valueOf(this.quantity));
    }
    
    public BigDecimal getDiscountedTotalPrice() {
        if (this.product == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal price = BigDecimal.valueOf(this.product.getPrice());
        if (this.product.getDiscountRate() > 0) {
            BigDecimal discountRate = BigDecimal.valueOf(this.product.getDiscountRate() / 100.0);
            price = price.multiply(BigDecimal.ONE.subtract(discountRate));
        }
        return price.multiply(BigDecimal.valueOf(this.quantity));
    }
}