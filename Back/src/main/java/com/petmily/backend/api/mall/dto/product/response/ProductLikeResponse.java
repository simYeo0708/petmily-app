package com.petmily.backend.api.mall.dto.product.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductLikeResponse {
    private boolean isLiked;
    private Integer likeCount;
}
