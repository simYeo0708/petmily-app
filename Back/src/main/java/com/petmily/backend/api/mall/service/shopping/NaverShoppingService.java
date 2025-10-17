package com.petmily.backend.api.mall.service.shopping;

import com.petmily.backend.api.mall.dto.common.ProductResponse;
import com.petmily.backend.api.mall.dto.naver.NaverShoppingResponse;
import com.petmily.backend.api.mall.service.adapter.NaverProductAdapter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NaverShoppingService implements ShoppingService {

    private static final String NAVER_SHOPPING_API_URL = "https://openapi.naver.com/v1/search/shop.json";

    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.client-secret}")
    private String clientSecret;

    private final NaverProductAdapter adapter;
    private final RestTemplate restTemplate;

    @Override
    public List<ProductResponse> search(String keyword, String sort, Integer page, Integer size){
        try{
            String url = buildUrl(keyword, sort, page, size);
            HttpEntity<String> entity = createHttpEntity();

            ResponseEntity<NaverShoppingResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    NaverShoppingResponse.class
            );

            if(response.getBody() == null || response.getBody().getItems() == null) {
                return Collections.emptyList();
            }

            return response.getBody().getItems().stream()
                    .map(adapter::convert)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("네이버 쇼핑 API 호출 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public String getServiceType() {
        return "NAVER";
    }

    private String buildUrl(String keyword, String sort, Integer page, Integer size){
        return UriComponentsBuilder.fromHttpUrl(NAVER_SHOPPING_API_URL)
                .queryParam("query", keyword)
                .queryParam("display", size)
                .queryParam("start", page)
                .queryParam("sort", sort != null ? sort : "sim")
                .toUriString();
    }

    private HttpEntity<String> createHttpEntity() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Naver-Client-Id", clientId);
        headers.set("X-Naver-Client-Secret", clientSecret);
        return new HttpEntity<>(headers);
    }
}
