package com.petmily.backend.api.mall.dto.product.request;

import com.petmily.backend.domain.mall.product.entity.ProductCategory;
import com.petmily.backend.domain.mall.product.entity.ProductStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUpdateRequest {

    @Size(max = 200, message = "상품명은 200자 이내여야 합니다")
    private String name;

    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "가격은 0보다 커야 합니다.")
    private BigDecimal price;

    @Min(value = 0, message = "재고 수량은 0 이상이어야 합니다")
    private Integer stockQuantity;

    private ProductCategory category;

    private ProductStatus status;

    private List<String> imageUrls;

}
