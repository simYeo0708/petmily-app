package com.petmily.backend.api.order.dto;

import com.petmily.backend.domain.order.entity.ReturnReason;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReturnCreateRequest {
    
    @NotNull(message = "주문 번호는 필수입니다")
    private Long orderId;
    
    @NotNull(message = "반품 사유는 필수입니다")
    private ReturnReason reason;
    
    @NotBlank(message = "상세 반품 사유는 필수입니다")
    private String detailedReason;
    
    @NotBlank(message = "수거 주소는 필수입니다")
    private String collectionAddress;
    
    @NotEmpty(message = "반품할 상품을 선택해주세요")
    @Valid
    private List<ReturnItemRequest> returnItems;
    
    @Getter
    @Setter
    public static class ReturnItemRequest {
        @NotNull(message = "주문 상품 번호는 필수입니다")
        private Long orderItemId;
        
        @NotNull(message = "반품 수량은 필수입니다")
        private Integer quantity;
        
        private String conditionNote;
    }
}