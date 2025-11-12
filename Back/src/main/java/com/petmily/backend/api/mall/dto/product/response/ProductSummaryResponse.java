package com.petmily.backend.api.mall.dto.product.response;

import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.entity.ProductCategory;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSummaryResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private ProductCategory category;
    private List<String> imageUrls;
    private String sellerName;

    public static ProductSummaryResponse from(Product product) {
        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .category(product.getCategory())
                .imageUrls(product.getImageUrls())
                .sellerName(product.getSeller().getName())
                .build();
    }

}
