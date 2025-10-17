package com.petmily.backend.api.mall.service.shopping;

import com.petmily.backend.api.mall.dto.common.ProductResponse;

import java.util.List;

public interface ShoppingService {

    List<ProductResponse> search(String keyword, String sort, Integer page, Integer size);

    String getServiceType();

}
