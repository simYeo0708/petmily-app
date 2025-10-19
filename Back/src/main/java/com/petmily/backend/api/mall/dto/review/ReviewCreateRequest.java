package com.petmily.backend.api.mall.dto.review;

import com.petmily.backend.api.mall.enums.ShoppingMall;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCreateRequest {

    @NotBlank(message = "상품 ID는 필수입니다.")
    private String externalProductId;

    @NotBlank(message = "상품명은 필수입니다.")
    private String productName;

    private String productImageUrl;

    @NotNull(message = "쇼핑몰 정보는 필수입니다.")
    private ShoppingMall source;

    @NotNull(message = "평점은 필수입니다.")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다.")
    private Integer rating;

    @NotBlank(message = "리뷰 내용은 필수입니다.")
    @Size(min = 10, max = 1000, message = "리뷰는 10자 이상 1000자 이하로 작성해주세요.")
    private String content;

    private List<String> imageUrls;
}
