package com.petmily.backend.api.mall.dto.naver;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NaverShoppingResponse {
    private String lastBuildDate;
    private Integer total;
    private Integer start;
    private Integer display;
    private List<NaverProduct> items;
}
