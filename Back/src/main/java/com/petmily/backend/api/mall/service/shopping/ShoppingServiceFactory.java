package com.petmily.backend.api.mall.service.shopping;

import com.petmily.backend.api.mall.dto.common.ProductResponse;
import com.petmily.backend.api.mall.enums.ShoppingMall;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShoppingServiceFactory {

    private final List<ShoppingService> shoppingServices;

    /**
     * 특정 쇼핑몰에서만 검색
     */
    public List<ProductResponse> search(ShoppingMall source, String keyword, String sort, Integer page, Integer size){
        if(source == ShoppingMall.ALL){
            return searchAll(keyword, sort, page, size);
        }

        ShoppingService service = getService(source);
        return service.search(keyword, sort, page, size);
    }

    /**
     * 모든 쇼핑몰에서 검색(통합 검색)
     */
    public List<ProductResponse> searchAll(String keyword, String sort, Integer page, Integer size){
        List<ProductResponse> allProducts = new ArrayList<>();

        for(ShoppingService service : shoppingServices){
            try{
                List<ProductResponse> products = service.search(keyword, sort, page, size);
                allProducts.addAll(products);
            } catch (Exception e) {
                continue;
            }
        }

        if("asc".equals(sort)){
            allProducts.sort((p1, p2) -> Integer.compare(p1.getPrice(), p2.getPrice()));
        } else if("dsc".equals(sort)){
            allProducts.sort((p1, p2) -> Integer.compare(p2.getPrice(), p1.getPrice()));
        }

        return allProducts;
    }

    private ShoppingService getService(ShoppingMall source){
        Map<String, ShoppingService> serviceMap = shoppingServices.stream()
                .collect(Collectors.toMap(ShoppingService::getServiceType, Function.identity()));

        ShoppingService service = serviceMap.get(source.name());
        if(service == null){
            throw new IllegalArgumentException("지원하지 않는 쇼핑몰입니다: " + source);
        }
        return service;
    }

}
