package com.petmily.backend.api.mall.service.wishlist;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.fcm.dto.FcmSendDto;
import com.petmily.backend.api.fcm.service.FcmService;
import com.petmily.backend.api.mall.dto.common.ProductResponse;
import com.petmily.backend.api.mall.dto.wishlist.WishlistAddRequest;
import com.petmily.backend.api.mall.dto.wishlist.WishlistResponse;
import com.petmily.backend.api.mall.enums.ShoppingMall;
import com.petmily.backend.api.mall.service.shopping.ShoppingServiceFactory;
import com.petmily.backend.api.notification.service.NotificationService;
import com.petmily.backend.domain.mall.wishlist.entity.Wishlist;
import com.petmily.backend.domain.mall.wishlist.repository.WishlistRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ShoppingServiceFactory shoppingServiceFactory;
    private final UserRepository userRepository;
    private final FcmService fcmService;

    /**
     * 찜하기 추가
     */
    @Transactional
    public WishlistResponse addWishlist(Long userId, WishlistAddRequest request){
        if(wishlistRepository.existsByUserIdAndExternalProductIdAndSource(
                userId, request.getExternalProductId(), request.getSource())) {
            throw new CustomException(ErrorCode.WISHLIST_ALREADY_EXISTS);
        }

        Wishlist wishlist = Wishlist.builder()
                .userId(userId)
                .externalProductId(request.getExternalProductId())
                .productName(request.getProductName())
                .savedPrice(request.getPrice())
                .currentPrice(request.getPrice())
                .imageUrl(request.getImageUrl())
                .productUrl(request.getProductUrl())
                .mallName(request.getMallName())
                .source(request.getSource())
                .lastChecked(LocalDateTime.now())
                .build();

        Wishlist saved = wishlistRepository.save(wishlist);
        return convertToResponse(saved);
    }

    /**
     * 찜하기 삭제
     */
    @Transactional
    public void deleteWishlist(Long userId, Long wishlistId){
        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new CustomException(ErrorCode.WISHLIST_NOT_FOUND));

        if(!wishlist.getUserId().equals(userId)){
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        wishlistRepository.delete(wishlist);
    }

    /**
     * 내 찜 목록 조회
     */
    public List<WishlistResponse> getMyWishlist(Long userId){
        List<Wishlist> wishlists = wishlistRepository.findByUserIdOrderByCreateTimeDesc(userId);

        return wishlists.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 찜 여부 확인
     */
    public boolean isWishlisted(Long userId, String externalProductId, ShoppingMall source){
        return wishlistRepository.existsByUserIdAndExternalProductIdAndSource(
                userId, externalProductId, source);
    }

    /**
     * 가격 변동 체크 스케줄러 (6시간마다)
     */
    @Scheduled(cron = "0 0 */6 * * *")
    @Transactional
    public void checkPriceChanges() {
        log.info("가격 변동 체크 시작...");

        List<Wishlist> allWishlists = wishlistRepository.findAll();
        int updatedCount = 0;
        int droppedCount = 0;
        int notificationSentCount = 0;

        for(Wishlist wishlist : allWishlists) {
            try{
                // 현재 가격 조회
                List<ProductResponse> searchResults = shoppingServiceFactory.search(
                        wishlist.getSource(),
                        wishlist.getProductName(),
                        "sim",
                        1,
                        10
                );

                ProductResponse currentProduct = searchResults.stream()
                        .filter(p -> p.getProductId().equals(wishlist.getExternalProductId()))
                        .findFirst()
                        .orElse(null);

                if(currentProduct != null){
                    int oldPrice = wishlist.getCurrentPrice();
                    int newPrice = currentProduct.getPrice();

                    if(newPrice < oldPrice) {
                        int priceDrop = oldPrice - newPrice;
                        log.info("가격 하락 감지: {} ({}원 -> {}원, -{}원",
                                wishlist.getProductName(), oldPrice, newPrice, priceDrop);

                        boolean sent = sendPriceDropNotification(
                                wishlist.getUserId(),
                                wishlist.getProductName(),
                                oldPrice,
                                newPrice,
                                priceDrop
                        );

                        if (sent) {
                            notificationSentCount++;
                        }
                        droppedCount ++;
                    }
                    wishlist.updatePrice(newPrice);
                    updatedCount++;
                }
            } catch (Exception e){
                log.error("가격 체크 실패: {} - {}", wishlist.getProductName(), e.getMessage());
            }
        }
        log.info("가격 변동 체크 완료 - 전체: {}, 업데이트: {}, 가격하락: {}, 알림발송: {}",
                allWishlists.size(), updatedCount, droppedCount, notificationSentCount);
    }

    /**
     * 특정 사용자의 가격 변동 수동 체크
     */
    @Transactional
    public void checkUserWishlistPrices(Long userId){
        List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);

        for(Wishlist wishlist : wishlists){
            try{
                List<ProductResponse> searchResults = shoppingServiceFactory.search(
                        wishlist.getSource(),
                        wishlist.getProductName(),
                        "sim",
                        1,
                        10
                );

                ProductResponse currentProduct = searchResults.stream()
                        .filter(p -> p.getProductId().equals(wishlist.getExternalProductId()))
                        .findFirst()
                        .orElse(null);

                if(currentProduct != null){
                    wishlist.updatePrice(currentProduct.getPrice());
                }
            } catch (Exception e){
                log.error("가격 체크 실패: {}", wishlist.getProductName());
            }
        }
    }

    private boolean sendPriceDropNotification(Long userId, String productName,
                                              int oldPrice, int newPrice, int priceDrop){
        try{
            User user = userRepository.findById(userId).orElse(null);

            if(user == null){
                log.warn("사용자를 찾을 수 없음: userId={}", userId);
                return false;
            }

            String fcmToken = user.getFcmToken();
            if(fcmToken == null || fcmToken.isBlank()){
                log.debug("FCM 토큰 없음: userId={}", userId);
                return false;
            }

            if(user.getNotificationSetting() != null &&
            !Boolean.TRUE.equals(user.getNotificationSetting().getPushEnabled())){
                log.debug("푸시 알림 비활성화: userId={}", userId);
                return false;
            }

            FcmSendDto fcmSendDto = FcmSendDto.builder()
                    .token(fcmToken)
                    .title("찜한 상품 가격이 떨어졌어요!")
                    .body(String.format("%s\n%s원 -> %s원 (-%s원)",
                            productName,
                            formatPrice(oldPrice),
                            formatPrice(newPrice),
                            formatPrice(priceDrop)))
                    .build();

            fcmService.sendMessageTo(fcmSendDto);

            log.info("가격 하락 알림 발송 성공: userId={}, product={}", userId, productName);
            return true;
        } catch(Exception e) {
            log.error("가격 하락 알림 발송 실패: userId={}, product={}, error={}",
                    userId, productName, e.getMessage());
            return false;
        }
    }

    private String formatPrice(int price){
        return String.format("%,d", price);
    }

    private WishlistResponse convertToResponse(Wishlist wishlist){
        boolean priceDropped = wishlist.getCurrentPrice() < wishlist.getSavedPrice();
        int priceDifference = wishlist.getSavedPrice() - wishlist.getCurrentPrice();

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .externalProductId(wishlist.getExternalProductId())
                .productName(wishlist.getProductName())
                .savedPrice(wishlist.getSavedPrice())
                .currentPrice(wishlist.getCurrentPrice())
                .imageUrl(wishlist.getImageUrl())
                .productUrl(wishlist.getProductUrl())
                .mallName(wishlist.getMallName())
                .source(wishlist.getSource())
                .lastChecked(wishlist.getLastChecked())
                .createdAt(wishlist.getCreateTime())
                .priceDropped(priceDropped)
                .priceDifference(priceDifference)
                .build();
    }

}
