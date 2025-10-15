package com.petmily.backend.domain.order.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "returns")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Builder
public class Return extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "order_id")
    private Long orderId;
    
    @NotNull
    @Column(name = "user_id")
    private Long userId;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "reason")
    private ReturnReason reason;
    
    @NotBlank
    @Column(name = "detailed_reason", columnDefinition = "TEXT")
    private String detailedReason;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ReturnStatus status = ReturnStatus.REQUESTED;
    
    @Column(name = "return_amount")
    private BigDecimal returnAmount;
    
    @Column(name = "collection_address", columnDefinition = "TEXT")
    private String collectionAddress;
    
    @Column(name = "tracking_number")
    private String trackingNumber;
    
    @Column(name = "admin_memo", columnDefinition = "TEXT")
    private String adminMemo;
    
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Column(name = "refund_method")
    private String refundMethod;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;
    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @OneToMany(mappedBy = "returnRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReturnItem> returnItems = new ArrayList<>();
    
    public void approve(String adminMemo) {
        if (this.status != ReturnStatus.REQUESTED) {
            throw new IllegalStateException("신청 상태의 반품만 승인할 수 있습니다.");
        }
        this.status = ReturnStatus.APPROVED;
        this.adminMemo = adminMemo;
        this.processedAt = LocalDateTime.now();
    }
    
    public void reject(String rejectionReason) {
        if (this.status != ReturnStatus.REQUESTED) {
            throw new IllegalStateException("신청 상태의 반품만 거절할 수 있습니다.");
        }
        this.status = ReturnStatus.REJECTED;
        this.rejectionReason = rejectionReason;
        this.processedAt = LocalDateTime.now();
    }
    
    public void collect(String trackingNumber) {
        if (this.status != ReturnStatus.APPROVED) {
            throw new IllegalStateException("승인된 반품만 회수 처리할 수 있습니다.");
        }
        this.status = ReturnStatus.COLLECTED;
        this.trackingNumber = trackingNumber;
    }
    
    public void inspect() {
        if (this.status != ReturnStatus.COLLECTED) {
            throw new IllegalStateException("회수된 반품만 검수 처리할 수 있습니다.");
        }
        this.status = ReturnStatus.INSPECTED;
    }
    
    public void refund(String refundMethod) {
        if (this.status != ReturnStatus.INSPECTED) {
            throw new IllegalStateException("검수 완료된 반품만 환불 처리할 수 있습니다.");
        }
        this.status = ReturnStatus.REFUNDED;
        this.refundMethod = refundMethod;
        this.refundedAt = LocalDateTime.now();
    }
    
    public void cancel() {
        if (this.status == ReturnStatus.REFUNDED) {
            throw new IllegalStateException("환불 완료된 반품은 취소할 수 없습니다.");
        }
        this.status = ReturnStatus.CANCELLED;
    }
    
    public boolean canCancel() {
        return this.status != ReturnStatus.REFUNDED;
    }
    
    public boolean isCompleted() {
        return this.status == ReturnStatus.REFUNDED;
    }
    
    public boolean isPending() {
        return this.status == ReturnStatus.REQUESTED;
    }
    
    public void addReturnItem(ReturnItem returnItem) {
        this.returnItems.add(returnItem);
        calculateReturnAmount();
    }
    
    public void calculateReturnAmount() {
        this.returnAmount = this.returnItems.stream()
            .map(ReturnItem::getReturnAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}