package com.petmily.backend.api.mall.service.adapter;

import com.petmily.backend.api.mall.dto.common.ProductResponse;

public interface ProductAdapter<T> {

    ProductResponse convert(T source);

}
