package com.petmily.backend.api.subscription.service;

import com.petmily.backend.api.subscription.dto.*;
import com.petmily.backend.domain.order.repository.SubscriptionOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionOrderRepository subscriptionOrderRepository;

    public SubscriptionListResponse getSubscriptions(Long userId, Pageable pageable) {
        // TODO: 정기배송 목록 조회 로직 구현
        return null;
    }

    public SubscriptionDetailResponse getSubscription(Long subscriptionId, Long userId) {
        // TODO: 정기배송 상세 조회 로직 구현
        return null;
    }

    @Transactional
    public SubscriptionDetailResponse createSubscription(Long userId, SubscriptionCreateRequest request) {
        // TODO: 정기배송 신청 로직 구현
        // 1. 첫 주문 생성
        // 2. 정기배송 설정 생성
        // 3. 다음 배송일 계산
        return null;
    }

    @Transactional
    public SubscriptionDetailResponse updateSubscription(Long subscriptionId, Long userId, SubscriptionUpdateRequest request) {
        // TODO: 정기배송 설정 변경 로직 구현
        return null;
    }

    @Transactional
    public void pauseSubscription(Long subscriptionId, Long userId, LocalDate pauseUntil) {
        // TODO: 정기배송 일시정지 로직 구현
    }

    @Transactional
    public void resumeSubscription(Long subscriptionId, Long userId) {
        // TODO: 정기배송 재개 로직 구현
    }

    @Transactional
    public void cancelSubscription(Long subscriptionId, Long userId) {
        // TODO: 정기배송 해지 로직 구현
    }

    public Object getSubscriptionHistory(Long subscriptionId, Long userId, Pageable pageable) {
        // TODO: 정기배송 주문 이력 조회 로직 구현
        return null;
    }

    @Scheduled(cron = "0 0 9 * * ?") // 매일 오전 9시 실행
    @Transactional
    public void processScheduledDeliveries() {
        // TODO: 정기배송 스케줄 처리 로직 구현
        // 1. 오늘 배송 예정인 정기배송 조회
        // 2. 자동 주문 생성
        // 3. 다음 배송일 계산 및 업데이트
    }

    private LocalDate calculateNextDeliveryDate(LocalDate currentDate, String subscriptionType, Integer intervalDays) {
        // TODO: 다음 배송일 계산 로직 구현
        return null;
    }
}