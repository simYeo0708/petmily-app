package com.petmily.backend.api.search.service;

import com.petmily.backend.api.search.dto.MenuItem;
import com.petmily.backend.api.search.dto.MenuSearchResponse;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Slf4j
@Service
public class MenuSearchService {

    private List<MenuItem> allMenuItems;

    @PostConstruct
    public void init() {
        allMenuItems = new ArrayList<>();

        // ==== 산책 관련 ====
        allMenuItems.add(MenuItem.builder()
                .id("walk_direct_booking")
                .title("직접 예약")
                .description("원하는 워커를 선택해서 산책 예약하기")
                .category("산책")
                .route("/bookings/direct")
                .keywords(List.of("직접", "예약", "워커", "선택", "산책", "direct", "booking"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walk_direct_booking_list")
                .title("내 직접 예약")
                .description("내가 직접 예약한 산책 내역")
                .category("산책")
                .route("/bookings/direct/user")
                .keywords(List.of("직접", "예약", "내역", "목록", "산책"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walk_open_booking")
                .title("오픈 예약")
                .description("산책 요청을 등록하고 워커 지원 받기")
                .category("산책")
                .route("/bookings/open")
                .keywords(List.of("오픈", "예약", "요청", "워커", "지원", "산책", "open", "booking"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walk_open_booking_list")
                .title("내 오픈 예약")
                .description("내가 등록한 오픈 예약 목록")
                .category("산책")
                .route("/bookings/open/user")
                .keywords(List.of("오픈", "예약", "목록", "내역", "산책"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walk_applications")
                .title("워커 지원 목록")
                .description("내 오픈 예약에 지원한 워커 목록")
                .category("산책")
                .route("/bookings/open/applications")
                .keywords(List.of("워커", "지원", "목록", "지원자", "산책"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walk_status")
                .title("산책 진행 현황")
                .description("현재 진행 중인 산책 상세 정보")
                .category("산책")
                .route("/walk/status")
                .keywords(List.of("산책", "진행", "현황", "상태", "실시간", "status"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walk_history")
                .title("산책 기록")
                .description("완료된 산책 기록 보기")
                .category("산책")
                .route("/walk/history")
                .keywords(List.of("산책", "기록", "히스토리", "내역", "history"))
                .build());

        // ==== 워커 관련 ====
        allMenuItems.add(MenuItem.builder()
                .id("walker_search")
                .title("워커 찾기")
                .description("조건에 맞는 워커 검색")
                .category("워커")
                .route("/walkers/search")
                .keywords(List.of("워커", "찾기", "검색", "조회", "walker", "search"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walker_favorites")
                .title("즐겨찾기 워커")
                .description("내가 즐겨찾기한 워커 목록")
                .category("워커")
                .route("/walkers/favorites")
                .keywords(List.of("워커", "즐겨찾기", "북마크", "favorites"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walker_register")
                .title("워커 등록")
                .description("워커로 등록하고 서비스 시작하기")
                .category("워커")
                .route("/walkers/register")
                .keywords(List.of("워커", "등록", "신청", "가입", "register"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walker_profile")
                .title("워커 프로필")
                .description("워커 프로필 관리 및 수정")
                .category("워커")
                .route("/walkers/me")
                .keywords(List.of("워커", "프로필", "정보", "수정", "profile"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walker_bookings")
                .title("워커 예약 내역")
                .description("워커로 받은 예약 내역")
                .category("워커")
                .route("/bookings/walker")
                .keywords(List.of("워커", "예약", "내역", "목록", "booking"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walker_open_list")
                .title("오픈 예약 보기")
                .description("지원 가능한 오픈 예약 목록")
                .category("워커")
                .route("/bookings/open/list")
                .keywords(List.of("오픈", "예약", "목록", "지원", "open"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walker_my_applications")
                .title("내 지원 내역")
                .description("워커로 지원한 예약 내역")
                .category("워커")
                .route("/bookings/open/walker")
                .keywords(List.of("지원", "내역", "목록", "워커", "application"))
                .build());

        // ==== 워커 리뷰 관련 ====
        allMenuItems.add(MenuItem.builder()
                .id("walker_reviewable")
                .title("워커 리뷰 작성")
                .description("완료된 산책 중 리뷰 작성 가능한 목록")
                .category("리뷰")
                .route("/walker/reviews/reviewable-bookings")
                .keywords(List.of("워커", "리뷰", "작성", "평가", "후기", "완료", "review"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walker_review_my")
                .title("내 워커 리뷰")
                .description("내가 작성한 워커 리뷰 목록")
                .category("리뷰")
                .route("/walker/reviews/my")
                .keywords(List.of("워커", "리뷰", "내", "작성", "목록", "review"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("walker_my_reports")
                .title("워커 신고 내역")
                .description("내가 신고한 워커 내역 조회")
                .category("리뷰")
                .route("/walker/reviews/my-reports")
                .keywords(List.of("워커", "신고", "내역", "목록", "제보", "report"))
                .build());

        // ==== 쇼핑몰 관련 ====
        allMenuItems.add(MenuItem.builder()
                .id("mall_home")
                .title("쇼핑몰")
                .description("반려동물 용품 쇼핑")
                .category("쇼핑")
                .route("/mall")
                .keywords(List.of("쇼핑", "쇼핑몰", "용품", "구매", "상품", "mall", "shop", "product"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("mall_products")
                .title("상품 목록")
                .description("반려동물 상품 보기")
                .category("쇼핑")
                .route("/products")
                .keywords(List.of("상품", "목록", "쇼핑", "제품", "product"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("mall_cart")
                .title("장바구니")
                .description("장바구니에 담은 상품")
                .category("쇼핑")
                .route("/cart")
                .keywords(List.of("장바구니", "카트", "구매", "cart"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("mall_orders")
                .title("주문 내역")
                .description("내 주문 내역 확인")
                .category("쇼핑")
                .route("/orders")
                .keywords(List.of("주문", "내역", "구매", "order"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("mall_liked")
                .title("좋아요한 상품")
                .description("좋아요한 상품 모아보기")
                .category("쇼핑")
                .route("/products/liked")
                .keywords(List.of("좋아요", "상품", "관심", "찜", "like", "favorite"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("seller_products")
                .title("내 상품 관리")
                .description("판매자 상품 등록 및 관리")
                .category("판매자")
                .route("/product/my")
                .keywords(List.of("판매자", "상품", "관리", "등록", "seller", "product"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("seller_orders")
                .title("판매자 주문 관리")
                .description("판매한 상품의 주문 관리")
                .category("판매자")
                .route("/orders/seller")
                .keywords(List.of("판매", "주문", "관리", "seller", "order"))
                .build());

        // ==== 반려동물 관리 ====
        allMenuItems.add(MenuItem.builder()
                .id("pet_list")
                .title("반려동물 관리")
                .description("반려동물 정보 등록 및 관리")
                .category("마이페이지")
                .route("/pets")
                .keywords(List.of("반려동물", "펫", "등록", "관리", "pet"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("profile")
                .title("프로필 수정")
                .description("내 프로필 정보 수정")
                .category("마이페이지")
                .route("/users/me")
                .keywords(List.of("프로필", "정보", "수정", "profile"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("password_change")
                .title("비밀번호 변경")
                .description("계정 비밀번호 변경")
                .category("마이페이지")
                .route("/users/password")
                .keywords(List.of("비밀번호", "변경", "계정", "password"))
                .build());

        // ==== 대시보드 ====
        allMenuItems.add(MenuItem.builder()
                .id("dashboard")
                .title("대시보드")
                .description("나의 활동 통계 및 요약 정보")
                .category("마이페이지")
                .route("/dashboard")
                .keywords(List.of("대시보드", "통계", "요약", "활동", "dashboard"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("dashboard_walking")
                .title("산책 통계")
                .description("내 산책 통계 보기")
                .category("마이페이지")
                .route("/dashboard/walking")
                .keywords(List.of("산책", "통계", "대시보드", "활동"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("dashboard_pets")
                .title("반려동물 통계")
                .description("반려동물 관련 통계")
                .category("마이페이지")
                .route("/dashboard/pets")
                .keywords(List.of("반려동물", "통계", "대시보드", "펫"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("dashboard_shopping")
                .title("쇼핑 통계")
                .description("쇼핑 및 리뷰 통계")
                .category("마이페이지")
                .route("/dashboard/shopping")
                .keywords(List.of("쇼핑", "통계", "대시보드", "리뷰"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("dashboard_chat")
                .title("채팅 통계")
                .description("채팅 활동 통계")
                .category("마이페이지")
                .route("/dashboard/chat")
                .keywords(List.of("채팅", "통계", "대시보드", "활동"))
                .build());

        // ==== 알림 관련 ====
        allMenuItems.add(MenuItem.builder()
                .id("notification_settings")
                .title("알림 설정")
                .description("푸시 알림 및 알림 설정 관리")
                .category("설정")
                .route("/notifications/settings")
                .keywords(List.of("알림", "설정", "푸시", "notification"))
                .build());

        allMenuItems.add(MenuItem.builder()
                .id("notification_history")
                .title("알림 기록")
                .description("받은 알림 내역 확인")
                .category("설정")
                .route("/notifications/history")
                .keywords(List.of("알림", "기록", "내역", "notification", "history"))
                .build());

        // ==== 채팅 ====
        allMenuItems.add(MenuItem.builder()
                .id("chat")
                .title("채팅")
                .description("채팅방 목록 보기")
                .category("채팅")
                .route("/chat")
                .keywords(List.of("채팅", "채팅방", "목록", "메시지", "대화", "chat", "message"))
                .build());

        log.info("Initialized {} menu items", allMenuItems.size());
    }

    public MenuSearchResponse searchMenu(String query) {
        if (query == null || query.trim().isEmpty()) {
            return MenuSearchResponse.builder()
                    .query("")
                    .results(new ArrayList<>())
                    .suggestions(getPopularKeywords())
                    .totalCount(0)
                    .build();
        }

        String normalizeQuery = query.toLowerCase(Locale.ROOT).trim();

        List<MenuItem> results = allMenuItems.stream()
                .filter(menu -> matchesQuery(menu, normalizeQuery))
                .collect(Collectors.toList());

        List<String> suggestions = generateSuggestions(normalizeQuery);

        return MenuSearchResponse.builder()
                .query(query)
                .results(results)
                .suggestions(suggestions)
                .totalCount(results.size())
                .build();
    }

    public List<String> autocomplete(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getPopularKeywords();
        }

        String normalizedQuery = query.trim().toLowerCase(Locale.ROOT);

        return allMenuItems.stream()
                .flatMap(menu -> menu.getKeywords().stream())
                .distinct()
                .filter(keyword -> keyword.contains(normalizedQuery))
                .limit(5)
                .collect(Collectors.toList());
    }

    public List<MenuItem> getMenusByCategory(String category) {
        return allMenuItems.stream()
                .filter(menu -> menu.getCategory().equals(category))
                .collect(Collectors.toList());
    }

    private boolean matchesQuery(MenuItem menu, String query) {
        return containsIgnoreCase(menu.getTitle(), query)
                || containsIgnoreCase(menu.getDescription(), query)
                || menu.getRoute().toLowerCase(Locale.ROOT).contains(query)
                || menu.getKeywords().stream().anyMatch(keyword -> keyword.contains(query));
    }

    private boolean containsIgnoreCase(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private List<String> generateSuggestions(String query) {
        return allMenuItems.stream()
                .flatMap(menu -> menu.getKeywords().stream())
                .filter(keyword -> keyword.contains(query))
                .distinct()
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<String> getPopularKeywords() {
        return List.of("산책", "예약", "워커", "쇼핑", "상품", "장바구니", "알림", "대시보드");
    }
}



