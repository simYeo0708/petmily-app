package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReviewRequest;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReviewResponse;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReportRequest;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walk.entity.WalkDetail;
import com.petmily.backend.domain.walker.entity.*;
import com.petmily.backend.domain.walk.repository.WalkBookingRepository;
import com.petmily.backend.domain.walk.repository.WalkDetailRepository;
import com.petmily.backend.domain.walker.repository.WalkerRepository;
import com.petmily.backend.domain.walker.repository.WalkerReviewRepository;
import com.petmily.backend.domain.walker.repository.WalkerReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalkerReviewService {

    private final WalkerReviewRepository walkerReviewRepository;
    private final WalkerRepository walkerRepository;
    private final UserRepository userRepository;
    private final WalkBookingRepository walkBookingRepository;
    private final WalkDetailRepository walkDetailRepository;
    private final WalkerReportRepository walkerReportRepository;

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private WalkerReview findReviewById(Long reviewId) {
        return walkerReviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "리뷰를 찾을 수 없습니다."));
    }

    private Walker findWalkerById(Long walkerId) {
        return walkerRepository.findById(walkerId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "워커 프로필을 찾을 수 없습니다."));
    }

    private void validateReviewOwnership(WalkerReview review, User user) {
        if (!review.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "자신이 작성한 리뷰만 접근할 수 있습니다.");
        }
    }

    private WalkBooking findBookingById(Long bookingId) {
        return walkBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "예약을 찾을 수 없습니다."));
    }

    /**
     * 🔒 핵심 보안 검증: 리뷰 작성 권한 확인
     * - 완료된 예약에 대해서만 리뷰 작성 가능
     * - 본인이 예약한 산책에만 리뷰 작성 가능
     * - 한 예약에 대해 한 번만 리뷰 작성 가능
     */
    private void validateReviewEligibility(User user, Long bookingId, Long walkerId) {
        WalkBooking booking = findBookingById(bookingId);
        
        // 핵심 보안 체크 4가지
        if (booking.getStatus() != WalkBooking.BookingStatus.COMPLETED) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "완료된 산책에 대해서만 리뷰를 작성할 수 있습니다.");
        }
        
        if (!booking.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "본인이 예약한 산책에 대해서만 리뷰를 작성할 수 있습니다.");
        }
        
        if (!booking.getWalkerId().equals(walkerId)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "예약의 워커와 리뷰 대상 워커가 일치하지 않습니다.");
        }
        
        if (walkerReviewRepository.existsByBookingId(bookingId)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "이미 해당 산책에 대한 리뷰를 작성했습니다.");
        }
    }

    @Transactional
    public WalkerReviewResponse createReview(Long userId, WalkerReviewRequest request) {
        User user = findUserById(userId);
        Walker walker = findWalkerById(request.getWalkerId());

        // 🔒 핵심 보안 검증만 실행 (중복 제거)
        validateReviewEligibility(user, request.getBookingId(), request.getWalkerId());

        WalkerReview review = WalkerReview.builder()
                .userId(user.getId())
                .walkerId(walker.getId())
                .bookingId(request.getBookingId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        WalkerReview savedReview = walkerReviewRepository.save(review);
        return WalkerReviewResponse.from(savedReview);
    }

    @Transactional(readOnly = true)
    public List<WalkerReviewResponse> getWalkerReviews(Long walkerId) {
        // Verify walker exists
        findWalkerById(walkerId);

        List<WalkerReview> reviews = walkerReviewRepository.findByWalkerIdOrderByCreatedAtDesc(walkerId);
        return reviews.stream()
                .map(WalkerReviewResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getWalkerAverageRating(Long walkerId) {
        // Verify walker exists
        findWalkerById(walkerId);

        Double averageRating = walkerReviewRepository.findAverageRatingByWalkerId(walkerId);
        Long totalReviews = walkerReviewRepository.countByWalkerId(walkerId);

        Map<String, Object> result = new HashMap<>();
        result.put("averageRating", averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0);
        result.put("totalReviews", totalReviews);
        
        return result;
    }

    @Transactional(readOnly = true)
    public List<WalkerReviewResponse> getUserReviews(Long userId) {
        User user = findUserById(userId);

        List<WalkerReview> reviews = walkerReviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return reviews.stream()
                .map(WalkerReviewResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WalkerReviewResponse getReview(Long reviewId, Long userId) {
        User user = findUserById(userId);
        WalkerReview review = findReviewById(reviewId);
        validateReviewOwnership(review, user);

        return WalkerReviewResponse.from(review);
    }

    @Transactional
    public WalkerReviewResponse updateReview(Long reviewId, Long userId, WalkerReviewRequest request) {
        User user = findUserById(userId);
        WalkerReview review = findReviewById(reviewId);
        validateReviewOwnership(review, user);

        // Update review
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        WalkerReview updatedReview = walkerReviewRepository.save(review);
        return WalkerReviewResponse.from(updatedReview);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        User user = findUserById(userId);
        WalkerReview review = findReviewById(reviewId);
        validateReviewOwnership(review, user);

        walkerReviewRepository.delete(review);
    }

    /**
     * 사용자가 리뷰를 작성할 수 있는 완료된 예약 목록 조회 (간소화)
     * 프론트엔드에서 UI 최적화에 활용
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getReviewableBookings(Long userId) {
        User user = findUserById(userId);
        
        // 완료된 예약 중 리뷰가 아직 작성되지 않은 것들만 조회
        List<WalkBooking> completedBookings = walkBookingRepository
                .findByUserIdAndStatus(user.getId(), WalkBooking.BookingStatus.COMPLETED);
        
        return completedBookings.stream()
                .filter(booking -> !walkerReviewRepository.existsByBookingId(booking.getId()))
                .map(booking -> {
                    Map<String, Object> bookingInfo = new HashMap<>();
                    bookingInfo.put("bookingId", booking.getId());
                    bookingInfo.put("walkerId", booking.getWalkerId());
                    bookingInfo.put("date", booking.getDate());
                    bookingInfo.put("duration", booking.getDuration());

                    // Get timing information from WalkDetail
                    WalkDetail walkDetail = walkDetailRepository.findByBookingId(booking.getId()).orElse(null);
                    if (walkDetail != null) {
                        bookingInfo.put("actualStartTime", walkDetail.getActualStartTime());
                        bookingInfo.put("actualEndTime", walkDetail.getActualEndTime());
                    } else {
                        bookingInfo.put("actualStartTime", null);
                        bookingInfo.put("actualEndTime", null);
                    }

                    return bookingInfo;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public String reportWalker(Long userId, WalkerReportRequest request) {
        User user = findUserById(userId);
        Walker walker = findWalkerById(request.getWalkerId());

        // 중복 신고 체크
        if (request.getBookingId() != null &&
            walkerReportRepository.existsByReporterUserIdAndBookingId(user.getId(), request.getBookingId())) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "이미 해당 예약에 대해 신고를 접수하셨습니다.");
        }

        // 예약 검증 (예약 ID가 제공된 경우)
        if (request.getBookingId() != null) {
            WalkBooking booking = findBookingById(request.getBookingId());
            if (!booking.getUserId().equals(user.getId())) {
                throw new CustomException(ErrorCode.NO_ACCESS, "본인이 예약한 산책에 대해서만 신고할 수 있습니다.");
            }
            if (!booking.getWalkerId().equals(request.getWalkerId())) {
                throw new CustomException(ErrorCode.INVALID_REQUEST, "예약의 워커와 신고 대상 워커가 일치하지 않습니다.");
            }
        }

        WalkerReport report = WalkerReport.builder()
                .reporterUserId(user.getId())
                .reportedWalkerId(request.getWalkerId())
                .bookingId(request.getBookingId())
                .reportType(ReportType.valueOf(request.getReportType().name()))
                .reason(request.getReason())
                .description(request.getDescription())
                .status(ReportStatus.PENDING)
                .build();

        walkerReportRepository.save(report);
        return "신고가 접수되었습니다. 관리자 검토 후 처리됩니다.";
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserReports(Long userId) {
        User user = findUserById(userId);

        List<WalkerReport> reports = walkerReportRepository.findByReporterUserIdOrderByCreatedAtDesc(user.getId());

        return reports.stream()
                .map(report -> {
                    Map<String, Object> reportInfo = new HashMap<>();
                    reportInfo.put("id", report.getId());
                    reportInfo.put("walkerId", report.getReportedWalkerId());
                    reportInfo.put("bookingId", report.getBookingId());
                    reportInfo.put("reportType", report.getReportType());
                    reportInfo.put("reason", report.getReason());
                    reportInfo.put("description", report.getDescription());
                    reportInfo.put("status", report.getStatus());
                    reportInfo.put("reportedAt", report.getCreatedAt());
                    return reportInfo;
                })
                .collect(Collectors.toList());
    }

}
