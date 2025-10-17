package com.petmily.backend.api.mall.service.adapter;

import com.petmily.backend.api.mall.dto.common.ProductResponse;
import com.petmily.backend.api.mall.dto.naver.NaverProduct;
import com.petmily.backend.api.mall.enums.ShoppingMall;
import org.springframework.stereotype.Component;

@Component
public class NaverProductAdapter implements ProductAdapter<NaverProduct> {

    @Override
    public ProductResponse convert(NaverProduct naver){
        return ProductResponse.builder()
                .productId(naver.getProductId())
                .productName(removeHtmlTags(naver.getTitle()))
                .price(parseSafeInteger(naver.getLprice()))
                .imageUrl(naver.getImage())
                .productUrl(naver.getLink())
                .brand(naver.getBrand())
                .mallName(naver.getMallName())
                .category(naver.getCategory2())
                .source(ShoppingMall.NAVER)
                .isRocket(null)
                .isFreeShipping(null)
                .disCountRate(null)
                .build();
    }

    private String removeHtmlTags(String text){
        if(text == null) return "";
        return text.replaceAll("<[^>]*>", "");
    }

    private Integer parseSafeInteger(String value) {
        try{
            return Integer.parseInt(value);
        } catch(NumberFormatException e){
            return 0;
        }
    }

}
