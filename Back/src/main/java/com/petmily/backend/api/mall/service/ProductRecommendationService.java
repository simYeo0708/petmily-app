package com.petmily.backend.api.mall.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.entity.ProductStatus;
import com.petmily.backend.domain.mall.product.repository.ProductRepository;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductRecommendationService {

    private final ChatClient chatClient;
    private final PetRepository petRepository;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    public List<ProductRecommendation> recommendProducts(Long petId) {
        // 1. Pet 정보 가져오기
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "반려동물을 찾을 수 없습니다."));

        // 2. 상품 후보군 가져오기 (활성 상품 중 인기 상품 20개)
        List<Product> candidateProducts = productRepository
                .findByStatusOrderByLikeCountDesc(ProductStatus.ACTIVE, PageRequest.of(0, 20))
                .getContent();

        if (candidateProducts.isEmpty()) {
            return new ArrayList<>();
        }

        // 3. LLM에게 추천 요청
        String recommendationJson = generateRecommendation(pet, candidateProducts);

        // 4. JSON 파싱하여 추천 상품 리스트 생성
        return parseRecommendations(recommendationJson, candidateProducts);
    }

    private String generateRecommendation(Pet pet, List<Product> candidateProducts) {
        try {
            // Pet 정보를 JSON으로 변환
            Map<String, Object> petInfo = new HashMap<>();
            petInfo.put("name", pet.getName());
            petInfo.put("species", pet.getSpecies());
            petInfo.put("breed", pet.getBreed());
            petInfo.put("age", pet.getAge());
            petInfo.put("size", pet.getSize() != null ? pet.getSize().toString() : null);
            petInfo.put("activityLevel", pet.getActivityLevel() != null ? pet.getActivityLevel().toString() : null);
            petInfo.put("specialNotes", pet.getSpecialNotes());
            petInfo.put("allergies", pet.getAllergies());
            petInfo.put("medicalConditions", pet.getMedicalConditions());

            // 상품 후보군을 JSON으로 변환
            List<Map<String, Object>> productList = new ArrayList<>();
            for (Product product : candidateProducts) {
                Map<String, Object> productInfo = new HashMap<>();
                productInfo.put("id", product.getId());
                productInfo.put("name", product.getName());
                productInfo.put("description", product.getDescription());
                productInfo.put("category", product.getCategory() != null ? product.getCategory().toString() : null);
                productInfo.put("price", product.getPrice());
                productInfo.put("averageRating", product.getAverageRating());
                productInfo.put("likeCount", product.getLikeCount());
                productInfo.put("salesCount", product.getSalesCount());
                productList.add(productInfo);
            }

            // System Prompt
            String systemPrompt = "당신은 반려동물 전문 상품 추천 AI입니다. " +
                    "주어진 반려동물 정보와 상품 목록을 분석하여 최적의 상품 5개를 추천하고, 각 상품에 대한 추천 이유를 제공해야 합니다. " +
                    "응답은 반드시 다음 JSON 형식으로 제공해야 합니다:\n" +
                    "{\n" +
                    "  \"recommendations\": [\n" +
                    "    {\n" +
                    "      \"productId\": 1,\n" +
                    "      \"reason\": \"추천 이유\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n" +
                    "추천 상품은 반드시 주어진 상품 목록(productList) 안에서만 선택해야 합니다.";

            // User Prompt
            String userPrompt = String.format(
                    "반려동물 정보:\n%s\n\n상품 후보군:\n%s\n\n" +
                            "위 반려동물에게 적합한 상품 5개를 추천해주세요. " +
                            "각 상품에 대해 왜 이 상품이 이 반려동물에게 좋은지 구체적인 이유를 작성해주세요.",
                    objectMapper.writeValueAsString(petInfo),
                    objectMapper.writeValueAsString(productList)
            );

            // LLM 호출
            String response = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

            // JSON 추출 (응답에 마크다운 코드 블록이 있을 수 있음)
            response = response.trim();
            if (response.startsWith("```json")) {
                response = response.substring(7);
            }
            if (response.startsWith("```")) {
                response = response.substring(3);
            }
            if (response.endsWith("```")) {
                response = response.substring(0, response.length() - 3);
            }
            response = response.trim();

            return response;
        } catch (Exception e) {
            log.error("상품 추천 생성 중 오류 발생", e);
            // Fallback: 인기 상품 상위 5개 반환
            return generateFallbackRecommendations(candidateProducts);
        }
    }

    private String generateFallbackRecommendations(List<Product> candidateProducts) {
        try {
            List<Map<String, Object>> recommendations = new ArrayList<>();
            int count = Math.min(5, candidateProducts.size());
            
            for (int i = 0; i < count; i++) {
                Product product = candidateProducts.get(i);
                Map<String, Object> rec = new HashMap<>();
                rec.put("productId", product.getId());
                rec.put("reason", "인기 상품으로 추천합니다.");
                recommendations.add(rec);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("recommendations", recommendations);
            
            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            log.error("Fallback 추천 생성 중 오류", e);
            return "{\"recommendations\":[]}";
        }
    }

    private List<ProductRecommendation> parseRecommendations(String jsonResponse, List<Product> candidateProducts) {
        try {
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse, new TypeReference<Map<String, Object>>() {});
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> recommendations = (List<Map<String, Object>>) responseMap.get("recommendations");
            
            if (recommendations == null || recommendations.isEmpty()) {
                return new ArrayList<>();
            }

            // productId를 Long으로 변환하여 Map 생성
            Map<Long, Product> productMap = new HashMap<>();
            for (Product product : candidateProducts) {
                productMap.put(product.getId(), product);
            }

            List<ProductRecommendation> result = new ArrayList<>();
            for (Map<String, Object> rec : recommendations) {
                Object productIdObj = rec.get("productId");
                Long productId;
                
                // productId를 Long으로 변환
                if (productIdObj instanceof Integer) {
                    productId = ((Integer) productIdObj).longValue();
                } else if (productIdObj instanceof Long) {
                    productId = (Long) productIdObj;
                } else {
                    continue;
                }

                Product product = productMap.get(productId);
                if (product != null) {
                    String reason = rec.get("reason") != null ? rec.get("reason").toString() : "추천 상품입니다.";
                    result.add(new ProductRecommendation(product, reason));
                }
            }

            // 최대 5개까지만 반환
            return result.size() > 5 ? result.subList(0, 5) : result;
        } catch (Exception e) {
            log.error("추천 결과 파싱 중 오류 발생", e);
            // Fallback: 인기 상품 상위 5개 반환
            List<ProductRecommendation> fallback = new ArrayList<>();
            int count = Math.min(5, candidateProducts.size());
            for (int i = 0; i < count; i++) {
                fallback.add(new ProductRecommendation(candidateProducts.get(i), "인기 상품으로 추천합니다."));
            }
            return fallback;
        }
    }

    public static class ProductRecommendation {
        private final Product product;
        private final String reason;

        public ProductRecommendation(Product product, String reason) {
            this.product = product;
            this.reason = reason;
        }

        public Product getProduct() {
            return product;
        }

        public String getReason() {
            return reason;
        }
    }
}

