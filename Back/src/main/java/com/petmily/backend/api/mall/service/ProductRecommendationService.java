package com.petmily.backend.api.mall.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.mall.cart.entity.Cart;
import com.petmily.backend.domain.mall.cart.repository.CartRepository;
import com.petmily.backend.domain.mall.order.entity.Order;
import com.petmily.backend.domain.mall.order.entity.OrderStatus;
import com.petmily.backend.domain.mall.order.repository.OrderRepository;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.entity.ProductStatus;
import com.petmily.backend.domain.mall.product.repository.ProductLikeRepository;
import com.petmily.backend.domain.mall.product.repository.ProductRepository;
import com.petmily.backend.domain.mall.product.repository.ProductViewHistoryRepository;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductRecommendationService {

    private final ChatClient chatClient;
    private final PetRepository petRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductLikeRepository productLikeRepository;
    private final ProductViewHistoryRepository productViewHistoryRepository;
    private final CartRepository cartRepository;
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

    /**
     * 사용자 조회 이력 개수 확인
     */
    public int getViewHistoryCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "사용자를 찾을 수 없습니다."));
        
        return (int) productViewHistoryRepository.findAllByUserOrderByUpdatedAtDesc(
                user, PageRequest.of(0, 1000)).size();
    }

    /**
     * 사용자 행동 기반 상품 추천 (구매 이력, 좋아요, 장바구니, 조회 이력 활용)
     */
    public List<ProductRecommendation> recommendProductsByUser(Long userId) {
        // 1. 사용자 정보 가져오기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 2. 조회 이력 개수 확인 (최소 3개 이상 필요)
        int viewHistoryCount = (int) productViewHistoryRepository.findAllByUserOrderByUpdatedAtDesc(
                user, PageRequest.of(0, 1000)).size();
        
        if (viewHistoryCount < 3) {
            // 조회 이력이 부족하면 빈 리스트 반환
            return new ArrayList<>();
        }

        // 3. 사용자 반려동물 정보 가져오기 (알레르기 체크용)
        List<Pet> userPets = petRepository.findByUserId(userId);
        Set<String> allAllergies = userPets.stream()
                .filter(pet -> pet.getAllergies() != null)
                .flatMap(pet -> java.util.Arrays.stream(pet.getAllergies()))
                .collect(Collectors.toSet());

        // 3. 사용자 행동 데이터 수집
        // - 구매 이력 (완료된 주문)
        List<Order> completedOrders = orderRepository.findByUserAndStatus(
                user, OrderStatus.DELIVERED, PageRequest.of(0, 50)).getContent();
        Set<Long> purchasedProductIds = completedOrders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .map(item -> item.getProduct().getId())
                .collect(Collectors.toSet());

        // - 좋아요한 상품
        Set<Long> likedProductIds = productLikeRepository.findByUser(user, PageRequest.of(0, 50))
                .getContent().stream()
                .map(like -> like.getProduct().getId())
                .collect(Collectors.toSet());

        // - 장바구니에 담은 상품
        List<Cart> cartItems = cartRepository.findByUser(user);
        Set<Long> cartProductIds = cartItems.stream()
                .map(cart -> cart.getProduct().getId())
                .collect(Collectors.toSet());

        // - 조회 이력 (자주 본 카테고리 분석)
        // 조회 이력에서 카테고리별 조회 횟수 계산
        Map<String, Long> categoryViewCounts = productViewHistoryRepository
                .findCategoryViewCountsByUser(user).stream()
                .collect(Collectors.toMap(
                    result -> ((com.petmily.backend.domain.mall.product.entity.ProductCategory) result[0]).name(),
                    result -> ((Long) result[1])
                ));

        // 4. 사용자가 이미 구매/좋아요/장바구니에 담은 상품 제외하고 후보군 생성
        Set<Long> excludedProductIds = new HashSet<>();
        excludedProductIds.addAll(purchasedProductIds);
        excludedProductIds.addAll(likedProductIds);
        excludedProductIds.addAll(cartProductIds);

        // 5. 상품 후보군 가져오기 (활성 상품 중 인기 상품 30개)
        List<Product> allCandidateProducts = productRepository
                .findByStatusOrderByLikeCountDesc(ProductStatus.ACTIVE, PageRequest.of(0, 30))
                .getContent();

        // 이미 구매/좋아요/장바구니에 담은 상품 제외
        List<Product> candidateProducts = allCandidateProducts.stream()
                .filter(product -> !excludedProductIds.contains(product.getId()))
                .limit(20)
                .collect(Collectors.toList());

        if (candidateProducts.isEmpty()) {
            // 후보군이 없으면 인기 상품 상위 5개 반환 (알레르기 체크 포함)
            return allCandidateProducts.stream()
                    .limit(5)
                    .map(product -> {
                        List<String> allergyIngredients = checkAllergies(product, allAllergies);
                        return new ProductRecommendation(product, "인기 상품으로 추천합니다.", allergyIngredients);
                    })
                    .collect(Collectors.toList());
        }

        // 6. 사용자 행동 데이터를 기반으로 LLM에게 추천 요청 (조회 이력 포함)
        String recommendationJson = generateRecommendationByUserBehavior(
                user, purchasedProductIds, likedProductIds, cartProductIds, 
                categoryViewCounts, candidateProducts);

        // 7. JSON 파싱하여 추천 상품 리스트 생성 (알레르기 체크 포함)
        List<ProductRecommendation> recommendations = parseRecommendations(recommendationJson, candidateProducts);
        
        // 8. 각 추천 상품에 알레르기 체크 추가
        return recommendations.stream()
                .map(rec -> {
                    List<String> allergyIngredients = checkAllergies(rec.getProduct(), allAllergies);
                    return new ProductRecommendation(rec.getProduct(), rec.getReason(), allergyIngredients);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 상품 성분과 사용자 반려동물 알레르기 매칭
     */
    private List<String> checkAllergies(Product product, Set<String> userAllergies) {
        if (product.getIngredients() == null || product.getIngredients().isEmpty() || 
            userAllergies == null || userAllergies.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<String> matchedAllergies = new ArrayList<>();
        for (String ingredient : product.getIngredients()) {
            for (String allergy : userAllergies) {
                // 대소문자 구분 없이 부분 일치 체크
                if (ingredient.toLowerCase().contains(allergy.toLowerCase()) || 
                    allergy.toLowerCase().contains(ingredient.toLowerCase())) {
                    matchedAllergies.add(ingredient);
                    break;
                }
            }
        }
        return matchedAllergies;
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
                    result.add(new ProductRecommendation(product, reason, new ArrayList<>()));
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

    /**
     * 사용자 행동 기반 추천 생성 (조회 이력 포함)
     */
    private String generateRecommendationByUserBehavior(
            User user,
            Set<Long> purchasedProductIds,
            Set<Long> likedProductIds,
            Set<Long> cartProductIds,
            Map<String, Long> categoryViewCounts,
            List<Product> candidateProducts) {
        try {
            // 사용자 행동 데이터를 JSON으로 변환
            Map<String, Object> userBehavior = new HashMap<>();
            userBehavior.put("purchasedProductIds", new ArrayList<>(purchasedProductIds));
            userBehavior.put("likedProductIds", new ArrayList<>(likedProductIds));
            userBehavior.put("cartProductIds", new ArrayList<>(cartProductIds));
            userBehavior.put("purchasedCount", purchasedProductIds.size());
            userBehavior.put("likedCount", likedProductIds.size());
            userBehavior.put("cartCount", cartProductIds.size());
            userBehavior.put("categoryViewCounts", categoryViewCounts); // 조회 이력 기반 카테고리별 조회 횟수

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
            String systemPrompt = "당신은 사용자 행동 기반 상품 추천 AI입니다. " +
                    "사용자가 구매한 상품, 좋아요한 상품, 장바구니에 담은 상품의 패턴을 분석하여 " +
                    "사용자의 취향과 관심사에 맞는 상품 5개를 추천하고, 각 상품에 대한 추천 이유를 제공해야 합니다. " +
                    "응답은 반드시 다음 JSON 형식으로 제공해야 합니다:\n" +
                    "{\n" +
                    "  \"recommendations\": [\n" +
                    "    {\n" +
                    "      \"productId\": 1,\n" +
                    "      \"reason\": \"추천 이유\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n" +
                    "추천 상품은 반드시 주어진 상품 목록(productList) 안에서만 선택해야 합니다. " +
                    "사용자가 이미 구매하거나 좋아요한 상품은 제외되어 있으므로, 새로운 상품만 추천해야 합니다.";

            // User Prompt
            String userPrompt = String.format(
                    "사용자 행동 데이터:\n%s\n\n상품 후보군:\n%s\n\n" +
                            "위 사용자의 구매/좋아요/장바구니/조회 이력을 분석하여 취향에 맞는 상품 5개를 추천해주세요. " +
                            "특히 categoryViewCounts를 참고하여 사용자가 자주 본 카테고리의 상품을 우선적으로 추천해주세요. " +
                            "각 상품에 대해 왜 이 상품이 사용자에게 좋을지 구체적인 이유를 작성해주세요. " +
                            "사용자가 자주 구매하거나 좋아요한 상품의 카테고리, 가격대, 특성을 고려하여 추천해주세요.",
                    objectMapper.writeValueAsString(userBehavior),
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
            log.error("사용자 행동 기반 상품 추천 생성 중 오류 발생", e);
            // Fallback: 인기 상품 상위 5개 반환
            return generateFallbackRecommendations(candidateProducts);
        }
    }

    public static class ProductRecommendation {
        private final Product product;
        private final String reason;
        private final List<String> allergyIngredients; // 알레르기 성분 목록

        public ProductRecommendation(Product product, String reason) {
            this.product = product;
            this.reason = reason;
            this.allergyIngredients = new ArrayList<>();
        }

        public ProductRecommendation(Product product, String reason, List<String> allergyIngredients) {
            this.product = product;
            this.reason = reason;
            this.allergyIngredients = allergyIngredients != null ? allergyIngredients : new ArrayList<>();
        }

        public Product getProduct() {
            return product;
        }

        public String getReason() {
            return reason;
        }

        public List<String> getAllergyIngredients() {
            return allergyIngredients;
        }
    }
}

