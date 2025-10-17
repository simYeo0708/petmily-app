package com.petmily.backend.domain.mall.review.entity;

import com.petmily.backend.api.mall.enums.ShoppingMall;
import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name ="mall_review")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review extends BaseTimeEntity {

    private Long id;

    private Long userId;

    private String externalProductId;

    private String productName;

    private String productImageUrl;

    private ShoppingMall source;

    private Integer rating;

    private String content;

    private List<String> imageUrls = new ArrayList<>();
}
