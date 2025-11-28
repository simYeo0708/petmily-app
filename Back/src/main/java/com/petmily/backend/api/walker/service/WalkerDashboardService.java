package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.walker.dto.WalkerDashboardResponse;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walk.repository.WalkBookingRepository;
import com.petmily.backend.domain.walker.entity.Walker;
import com.petmily.backend.domain.walker.entity.WalkerReview;
import com.petmily.backend.domain.walker.repository.WalkerRepository;
import com.petmily.backend.domain.walker.repository.WalkerReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalkerDashboardService {

    private final WalkerRepository walkerRepository;
    private final UserRepository userRepository;
    private final WalkBookingRepository walkBookingRepository;
    private final WalkerReviewRepository walkerReviewRepository;
    private final PetRepository petRepository;

    public WalkerDashboardResponse getWalkerDashboard(Long userId) {
        // 워커 정보 확인
        Walker walker = walkerRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "워커 프로필을 찾을 수 없습니다."));

        Long walkerId = walker.getId();

        return WalkerDashboardResponse.builder()
                .earningsInfo(buildEarningsInfo(walkerId))
                .statisticsInfo(buildStatisticsInfo(walkerId))
                .recentReviews(getRecentReviews(walkerId))
                .upcomingBookings(getUpcomingBookings(walkerId))
                .weeklyEarnings(getWeeklyEarnings(walkerId))
                .build();
    }

    private WalkerDashboardResponse.EarningsInfo buildEarningsInfo(Long walkerId) {
        List<WalkBooking> completedBookings = walkBookingRepository
                .findByWalkerIdOrderByDateDesc(walkerId)
                .stream()
                .filter(booking -> booking.getStatus() == WalkBooking.BookingStatus.COMPLETED)
                .collect(Collectors.toList());

        // 총 수익
        Double totalEarnings = completedBookings.stream()
                .mapToDouble(booking -> booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0)
                .sum();

        // 이번 달 수익
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Double thisMonthEarnings = completedBookings.stream()
                .filter(booking -> booking.getCreatedAt() != null && booking.getCreatedAt().isAfter(startOfMonth))
                .mapToDouble(booking -> booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0)
                .sum();

        // 이번 주 수익
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(LocalDateTime.now().getDayOfWeek().getValue() - 1)
                .withHour(0).withMinute(0).withSecond(0);
        Double thisWeekEarnings = completedBookings.stream()
                .filter(booking -> booking.getCreatedAt() != null && booking.getCreatedAt().isAfter(startOfWeek))
                .mapToDouble(booking -> booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0)
                .sum();

        // 오늘 수익
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        Double todayEarnings = completedBookings.stream()
                .filter(booking -> booking.getCreatedAt() != null && booking.getCreatedAt().isAfter(startOfDay))
                .mapToDouble(booking -> booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0)
                .sum();

        // 지난달 수익 (성장률 계산용)
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        Double lastMonthEarnings = completedBookings.stream()
                .filter(booking -> booking.getCreatedAt() != null 
                        && booking.getCreatedAt().isAfter(startOfLastMonth)
                        && booking.getCreatedAt().isBefore(startOfMonth))
                .mapToDouble(booking -> booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0)
                .sum();

        // 성장률 계산
        Double growthRate = 0.0;
        if (lastMonthEarnings > 0) {
            growthRate = ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;
        } else if (thisMonthEarnings > 0) {
            growthRate = 100.0; // 첫 달이면 100% 성장
        }

        // 다음 정산 예정일 (매월 말일)
        LocalDateTime nextPayoutDate = LocalDateTime.now()
                .withDayOfMonth(1)
                .plusMonths(1)
                .minusDays(1)
                .withHour(23).withMinute(59).withSecond(59);

        return WalkerDashboardResponse.EarningsInfo.builder()
                .totalEarnings(totalEarnings)
                .thisMonthEarnings(thisMonthEarnings)
                .thisWeekEarnings(thisWeekEarnings)
                .todayEarnings(todayEarnings)
                .growthRate(Math.round(growthRate * 10.0) / 10.0) // 소수점 첫째자리까지
                .nextPayoutDate(nextPayoutDate)
                .build();
    }

    private WalkerDashboardResponse.StatisticsInfo buildStatisticsInfo(Long walkerId) {
        List<WalkBooking> allBookings = walkBookingRepository.findByWalkerIdOrderByDateDesc(walkerId);
        
        Integer totalWalks = allBookings.size();
        Integer completedWalks = (int) allBookings.stream()
                .filter(booking -> booking.getStatus() == WalkBooking.BookingStatus.COMPLETED)
                .count();
        Integer pendingWalks = (int) allBookings.stream()
                .filter(booking -> booking.getStatus() == WalkBooking.BookingStatus.PENDING 
                        || booking.getStatus() == WalkBooking.BookingStatus.CONFIRMED)
                .count();

        // 평균 평점
        Double averageRating = walkerReviewRepository.findAverageRatingByWalkerId(walkerId);
        if (averageRating == null) {
            averageRating = 0.0;
        }

        // 총 리뷰 수
        Integer totalReviews = walkerReviewRepository.countByWalkerId(walkerId).intValue();

        // 재요청률 계산 (같은 사용자로부터 2회 이상 예약받은 비율)
        long uniqueUsers = allBookings.stream()
                .map(WalkBooking::getUserId)
                .distinct()
                .count();
        
        long repeatUsers = allBookings.stream()
                .collect(Collectors.groupingBy(WalkBooking::getUserId, Collectors.counting()))
                .values()
                .stream()
                .filter(count -> count > 1)
                .count();

        Double repeatRate = uniqueUsers > 0 ? (double) repeatUsers / uniqueUsers * 100 : 0.0;

        return WalkerDashboardResponse.StatisticsInfo.builder()
                .totalWalks(totalWalks)
                .completedWalks(completedWalks)
                .pendingWalks(pendingWalks)
                .averageRating(Math.round(averageRating * 10.0) / 10.0) // 소수점 첫째자리까지
                .totalReviews(totalReviews)
                .repeatRate(Math.round(repeatRate * 10.0) / 10.0) // 소수점 첫째자리까지
                .build();
    }

    private List<WalkerDashboardResponse.ReviewInfo> getRecentReviews(Long walkerId) {
        List<WalkerReview> reviews = walkerReviewRepository.findByWalkerIdOrderByCreatedAtDesc(walkerId)
                .stream()
                .limit(3)
                .collect(Collectors.toList());

        return reviews.stream()
                .map(review -> {
                    User user = userRepository.findById(review.getUserId())
                            .orElse(null);
                    
                    // 예약 정보에서 반려동물 이름 가져오기
                    String petName = "반려동물";
                    if (review.getBookingId() != null) {
                        WalkBooking booking = walkBookingRepository.findById(review.getBookingId()).orElse(null);
                        if (booking != null && booking.getPetId() != null) {
                            Pet pet = petRepository.findById(booking.getPetId()).orElse(null);
                            if (pet != null) {
                                petName = pet.getName();
                            }
                        }
                    }

                    return WalkerDashboardResponse.ReviewInfo.builder()
                            .id(review.getId())
                            .userName(user != null ? user.getName() : "익명")
                            .rating(review.getRating().doubleValue())
                            .comment(review.getComment())
                            .createdAt(review.getCreatedAt())
                            .petName(petName)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<WalkerDashboardResponse.UpcomingBookingInfo> getUpcomingBookings(Long walkerId) {
        List<WalkBooking> upcomingBookings = walkBookingRepository.findByWalkerIdOrderByDateDesc(walkerId)
                .stream()
                .filter(booking -> {
                    WalkBooking.BookingStatus status = booking.getStatus();
                    return (status == WalkBooking.BookingStatus.PENDING 
                            || status == WalkBooking.BookingStatus.CONFIRMED)
                            && booking.getDate() != null
                            && booking.getDate().isAfter(LocalDateTime.now());
                })
                .sorted((b1, b2) -> b1.getDate().compareTo(b2.getDate()))
                .limit(5)
                .collect(Collectors.toList());

        return upcomingBookings.stream()
                .map(booking -> {
                    Pet pet = petRepository.findById(booking.getPetId()).orElse(null);
                    
                    return WalkerDashboardResponse.UpcomingBookingInfo.builder()
                            .id(booking.getId())
                            .date(booking.getDate())
                            .petName(pet != null ? pet.getName() : "반려동물")
                            .petBreed(pet != null ? pet.getBreed() : "")
                            .notes(booking.getNotes())
                            .status(booking.getStatus().name())
                            .address(booking.getPickupAddress() != null ? booking.getPickupAddress() : 
                                    booking.getPickupLocation() != null ? booking.getPickupLocation() : "")
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<WalkerDashboardResponse.WeeklyEarnings> getWeeklyEarnings(Long walkerId) {
        List<WalkBooking> completedBookings = walkBookingRepository
                .findByWalkerIdOrderByDateDesc(walkerId)
                .stream()
                .filter(booking -> booking.getStatus() == WalkBooking.BookingStatus.COMPLETED)
                .collect(Collectors.toList());

        List<WalkerDashboardResponse.WeeklyEarnings> weeklyEarnings = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // 최근 5주 데이터 생성
        for (int i = 4; i >= 0; i--) {
            LocalDateTime weekStart = now.minusWeeks(i).with(java.time.DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime weekEnd = weekStart.plusDays(6).withHour(23).withMinute(59).withSecond(59);

            Double weekEarnings = completedBookings.stream()
                    .filter(booking -> {
                        LocalDateTime createdAt = booking.getCreatedAt();
                        return createdAt != null && !createdAt.isBefore(weekStart) && !createdAt.isAfter(weekEnd);
                    })
                    .mapToDouble(booking -> booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0)
                    .sum();

            String weekLabel;
            if (i == 0) {
                weekLabel = "이번주";
            } else if (i == 1) {
                weekLabel = "지난주";
            } else {
                weekLabel = (5 - i) + "주전";
            }

            weeklyEarnings.add(WalkerDashboardResponse.WeeklyEarnings.builder()
                    .weekLabel(weekLabel)
                    .earnings(weekEarnings)
                    .build());
        }

        return weeklyEarnings;
    }
}

