package com.petmily.backend.api.mall.controller;

import com.petmily.backend.api.mall.dto.common.ProductResponse;
import com.petmily.backend.api.mall.dto.common.ProductSearchRequest;
import com.petmily.backend.api.mall.enums.PetCategory;
import com.petmily.backend.api.mall.service.shopping.ShoppingServiceFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mall")
@RequiredArgsConstructor
public class MallController {

    private final ShoppingServiceFactory shoppingServiceFactory;

    /**
     * 상품 검색
     */
    @GetMapping("/products/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(@ModelAttribute ProductSearchRequest request){
        String keyword = request.getKeyword();

        if(request.getCategory() != null){
            keyword = request.getCategory().getSearchKeyword().split("\\|")[0];
        }

        List<ProductResponse> products = shoppingServiceFactory.search(
                request.getSource(),
                keyword,
                request.getSort(),
                request.getPage(),
                request.getSize()
        );

        return ResponseEntity.ok(products);
    }

    /**
     * 카테고리별 상품 조회
     */
    @GetMapping("/products/category/{category}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(
            @PathVariable PetCategory category,
            @RequestParam(defaultValue = "sim") String sort,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {

        String keyword = category.getSearchKeyword().split("\\|")[0];

        List<ProductResponse> products = shoppingServiceFactory.searchAll(
                keyword,
                sort,
                page,
                size
        );

        return ResponseEntity.ok(products);
    }

}
