package com.petmily.backend.api.search.service.strategy;

import com.petmily.backend.api.search.dto.SearchResultItem;
import com.petmily.backend.api.search.service.SearchStrategy;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.entity.ProductStatus;
import com.petmily.backend.domain.mall.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductSearchStrategy implements SearchStrategy {

    private final ProductRepository productRepository;

    @Override
    public String getSearchType() {
        return "product";
    }

    @Override
    public List<SearchResultItem> search(String query) {
        List<Product> products = productRepository
                .searchByKeyword(query, ProductStatus.ACTIVE, PageRequest.of(0, 10))
                .getContent();

        return products.stream()
                .map(this::convertToSearchResult)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> autocomplete(String query) {
        List<Product> products = productRepository
                .searchByKeyword(query, ProductStatus.ACTIVE, PageRequest.of(0, 5))
                .getContent();

        return products.stream()
                .map(Product::getName)
                .distinct()
                .collect(Collectors.toList());
    }

    private SearchResultItem convertToSearchResult(Product product) {
        return SearchResultItem.builder()
                .type(getSearchType())
                .id(product.getId().toString())
                .title(product.getName())
                .description(product.getDescription())
                .route("/products/" + product.getId())
                .imageUrl(product.getImageUrls().isEmpty() ? null : product.getImageUrls().get(0))
                .metadata(Map.of(
                        "price", product.getPrice().toString(),
                        "category", product.getCategory().name(),
                        "seller", product.getSeller().getName(),
                        "likeCount", product.getLikeCount().toString(),
                        "rating", product.getAverageRating().toString()
                ))
                .build();
    }

}
