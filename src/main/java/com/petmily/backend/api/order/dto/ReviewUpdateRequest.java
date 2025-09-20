package com.petmily.backend.api.order.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReviewUpdateRequest {
    
    @NotNull(message = "평점은 필수입니다")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다")
    private Integer rating;
    
    @NotBlank(message = "리뷰 내용은 필수입니다")
    @Size(min = 10, max = 1000, message = "리뷰 내용은 10자 이상 1000자 이하여야 합니다")
    private String content;
    
    @Size(max = 5, message = "이미지는 최대 5개까지 등록 가능합니다")
    private List<String> imageUrls;
    
    private Boolean isAnonymous = false;
}