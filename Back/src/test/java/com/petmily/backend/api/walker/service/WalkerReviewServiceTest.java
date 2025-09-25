package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReviewRequest;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReviewResponse;
import com.petmily.backend.domain.user.entity.Role;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.entity.WalkerReview;
import com.petmily.backend.domain.walker.repository.WalkerBookingRepository;
import com.petmily.backend.domain.walker.repository.WalkerProfileRepository;
import com.petmily.backend.domain.walker.repository.WalkerReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
@DisplayName("WalkerReviewService 테스트")
class WalkerReviewServiceTest {

    @Mock
    private WalkerReviewRepository walkerReviewRepository;

    @Mock
    private WalkerProfileRepository walkerProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalkerBookingRepository walkerBookingRepository;

    @InjectMocks
    private WalkerReviewService walkerReviewService;

    private User testUser;
    private WalkerProfile testWalker;
    private WalkerBooking testBooking;
    private WalkerReview testReview;
    private WalkerReviewRequest testRequest;
    private String testUsername;

    @BeforeEach
    void setUp() {
        testUsername = "testuser";

        testUser = User.builder()
                .id(1L)
                .username(testUsername)
                .email("test@example.com")
                .name("Test User")
                .role(Role.USER)
                .build();

        testWalker = WalkerProfile.builder()
                .id(1L)
                .userId(2L)
                .bio("Experienced walker")
                .hourlyRate(15000.0)
                .build();

        testBooking = new WalkerBooking();
        testBooking.setId(1L);
        testBooking.setUserId(1L);
        testBooking.setWalkerId(1L);
        testBooking.setPetId(1L);
        testBooking.setDate(LocalDateTime.now().minusDays(1));
        testBooking.setDuration(60);
        testBooking.setStatus(WalkerBooking.BookingStatus.COMPLETED);
        testBooking.setTotalPrice(15000.0);
        testBooking.setActualStartTime(LocalDateTime.now().minusHours(2));
        testBooking.setActualEndTime(LocalDateTime.now().minusHours(1));

        testReview = WalkerReview.builder()
                .id(1L)
                .userId(1L)
                .walkerId(1L)
                .bookingId(1L)
                .rating(5)
                .comment("Great walker!")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testRequest = new WalkerReviewRequest();
        testRequest.setWalkerId(1L);
        testRequest.setBookingId(1L);
        testRequest.setRating(5);
        testRequest.setComment("Great walker!");
    }

    @Test
    @DisplayName("리뷰 생성 - 성공")
    void createReview_Success() {
        // given
        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.of(testWalker));
        given(walkerBookingRepository.findById(1L))
                .willReturn(Optional.of(testBooking));
        given(walkerReviewRepository.existsByBookingId(1L))
                .willReturn(false);
        given(walkerReviewRepository.save(any(WalkerReview.class)))
                .willReturn(testReview);

        // when
        WalkerReviewResponse response = walkerReviewService.createReview(testUsername, testRequest);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getWalkerId()).isEqualTo(1L);
        assertThat(response.getBookingId()).isEqualTo(1L);
        assertThat(response.getRating()).isEqualTo(5);
        assertThat(response.getComment()).isEqualTo("Great walker!");

        verify(userRepository).findByUsername(testUsername);
        verify(walkerProfileRepository).findById(1L);
        verify(walkerBookingRepository).findById(1L);
        verify(walkerReviewRepository).existsByBookingId(1L);
        verify(walkerReviewRepository).save(any(WalkerReview.class));
    }

    @Test
    @DisplayName("리뷰 생성 - 사용자를 찾을 수 없음")
    void createReview_UserNotFound() {
        // given
        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> walkerReviewService.createReview(testUsername, testRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);

        verify(userRepository).findByUsername(testUsername);
        verify(walkerProfileRepository, never()).findById(any());
    }

    @Test
    @DisplayName("리뷰 생성 - 워커 프로필을 찾을 수 없음")
    void createReview_WalkerNotFound() {
        // given
        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> walkerReviewService.createReview(testUsername, testRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND)
                .hasMessageContaining("워커 프로필을 찾을 수 없습니다.");

        verify(userRepository).findByUsername(testUsername);
        verify(walkerProfileRepository).findById(1L);
    }

    @Test
    @DisplayName("리뷰 생성 - 예약을 찾을 수 없음")
    void createReview_BookingNotFound() {
        // given
        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.of(testWalker));
        given(walkerBookingRepository.findById(1L))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> walkerReviewService.createReview(testUsername, testRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND)
                .hasMessageContaining("예약을 찾을 수 없습니다.");

        verify(userRepository).findByUsername(testUsername);
        verify(walkerProfileRepository).findById(1L);
        verify(walkerBookingRepository).findById(1L);
    }

    @Test
    @DisplayName("리뷰 생성 - 완료되지 않은 예약에 대한 리뷰 생성 시도")
    void createReview_BookingNotCompleted() {
        // given
        testBooking.setStatus(WalkerBooking.BookingStatus.IN_PROGRESS);

        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.of(testWalker));
        given(walkerBookingRepository.findById(1L))
                .willReturn(Optional.of(testBooking));

        // when & then
        assertThatThrownBy(() -> walkerReviewService.createReview(testUsername, testRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_REQUEST)
                .hasMessageContaining("완료된 산책에 대해서만 리뷰를 작성할 수 있습니다.");
    }

    @Test
    @DisplayName("리뷰 생성 - 본인 예약이 아닌 경우")
    void createReview_NotOwnBooking() {
        // given
        testBooking.setUserId(99L); // Different user ID

        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.of(testWalker));
        given(walkerBookingRepository.findById(1L))
                .willReturn(Optional.of(testBooking));

        // when & then
        assertThatThrownBy(() -> walkerReviewService.createReview(testUsername, testRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NO_ACCESS)
                .hasMessageContaining("본인이 예약한 산책에 대해서만 리뷰를 작성할 수 있습니다.");
    }

    @Test
    @DisplayName("리뷰 생성 - 워커 ID 불일치")
    void createReview_WalkerIdMismatch() {
        // given
        testBooking.setWalkerId(99L); // Different walker ID

        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.of(testWalker));
        given(walkerBookingRepository.findById(1L))
                .willReturn(Optional.of(testBooking));

        // when & then
        assertThatThrownBy(() -> walkerReviewService.createReview(testUsername, testRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_REQUEST)
                .hasMessageContaining("예약의 워커와 리뷰 대상 워커가 일치하지 않습니다.");
    }

    @Test
    @DisplayName("리뷰 생성 - 이미 리뷰가 존재하는 경우")
    void createReview_ReviewAlreadyExists() {
        // given
        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.of(testWalker));
        given(walkerBookingRepository.findById(1L))
                .willReturn(Optional.of(testBooking));
        given(walkerReviewRepository.existsByBookingId(1L))
                .willReturn(true);

        // when & then
        assertThatThrownBy(() -> walkerReviewService.createReview(testUsername, testRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_REQUEST)
                .hasMessageContaining("이미 해당 산책에 대한 리뷰를 작성하셨습니다.");
    }

    @Test
    @DisplayName("워커 리뷰 목록 조회 - 성공")
    void getWalkerReviews_Success() {
        // given
        List<WalkerReview> reviews = Arrays.asList(testReview);

        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.of(testWalker));
        given(walkerReviewRepository.findByWalkerIdOrderByCreatedAtDesc(1L))
                .willReturn(reviews);

        // when
        List<WalkerReviewResponse> responses = walkerReviewService.getWalkerReviews(1L);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getId()).isEqualTo(1L);
        assertThat(responses.get(0).getRating()).isEqualTo(5);
        assertThat(responses.get(0).getComment()).isEqualTo("Great walker!");

        verify(walkerProfileRepository).findById(1L);
        verify(walkerReviewRepository).findByWalkerIdOrderByCreatedAtDesc(1L);
    }

    @Test
    @DisplayName("워커 리뷰 목록 조회 - 워커를 찾을 수 없음")
    void getWalkerReviews_WalkerNotFound() {
        // given
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> walkerReviewService.getWalkerReviews(1L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND)
                .hasMessageContaining("워커 프로필을 찾을 수 없습니다.");

        verify(walkerProfileRepository).findById(1L);
        verify(walkerReviewRepository, never()).findByWalkerIdOrderByCreatedAtDesc(any());
    }

    @Test
    @DisplayName("워커 평균 평점 조회 - 성공")
    void getWalkerAverageRating_Success() {
        // given
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.of(testWalker));
        given(walkerReviewRepository.findAverageRatingByWalkerId(1L))
                .willReturn(4.5);
        given(walkerReviewRepository.countByWalkerId(1L))
                .willReturn(10L);

        // when
        Map<String, Object> result = walkerReviewService.getWalkerAverageRating(1L);

        // then
        assertThat(result).containsKey("averageRating");
        assertThat(result).containsKey("totalReviews");
        assertThat(result.get("averageRating")).isEqualTo(4.5);
        assertThat(result.get("totalReviews")).isEqualTo(10L);

        verify(walkerProfileRepository).findById(1L);
        verify(walkerReviewRepository).findAverageRatingByWalkerId(1L);
        verify(walkerReviewRepository).countByWalkerId(1L);
    }

    @Test
    @DisplayName("워커 평균 평점 조회 - 리뷰가 없는 경우")
    void getWalkerAverageRating_NoReviews() {
        // given
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.of(testWalker));
        given(walkerReviewRepository.findAverageRatingByWalkerId(1L))
                .willReturn(null);
        given(walkerReviewRepository.countByWalkerId(1L))
                .willReturn(0L);

        // when
        Map<String, Object> result = walkerReviewService.getWalkerAverageRating(1L);

        // then
        assertThat(result).containsKey("averageRating");
        assertThat(result).containsKey("totalReviews");
        assertThat(result.get("averageRating")).isEqualTo(0.0);
        assertThat(result.get("totalReviews")).isEqualTo(0L);
    }

    @Test
    @DisplayName("사용자 리뷰 목록 조회 - 성공")
    void getUserReviews_Success() {
        // given
        List<WalkerReview> reviews = Arrays.asList(testReview);

        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerReviewRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .willReturn(reviews);

        // when
        List<WalkerReviewResponse> responses = walkerReviewService.getUserReviews(testUsername);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getId()).isEqualTo(1L);
        assertThat(responses.get(0).getUserId()).isEqualTo(1L);

        verify(userRepository).findByUsername(testUsername);
        verify(walkerReviewRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    @DisplayName("특정 리뷰 조회 - 성공")
    void getReview_Success() {
        // given
        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerReviewRepository.findById(1L))
                .willReturn(Optional.of(testReview));

        // when
        WalkerReviewResponse response = walkerReviewService.getReview(1L, testUsername);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUserId()).isEqualTo(1L);

        verify(userRepository).findByUsername(testUsername);
        verify(walkerReviewRepository).findById(1L);
    }

    @Test
    @DisplayName("특정 리뷰 조회 - 리뷰를 찾을 수 없음")
    void getReview_ReviewNotFound() {
        // given
        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerReviewRepository.findById(1L))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> walkerReviewService.getReview(1L, testUsername))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND)
                .hasMessageContaining("리뷰를 찾을 수 없습니다.");
    }

    @Test
    @DisplayName("특정 리뷰 조회 - 본인 리뷰가 아닌 경우")
    void getReview_NotOwnReview() {
        // given
        testReview.setUserId(99L); // Different user ID

        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerReviewRepository.findById(1L))
                .willReturn(Optional.of(testReview));

        // when & then
        assertThatThrownBy(() -> walkerReviewService.getReview(1L, testUsername))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NO_ACCESS)
                .hasMessageContaining("자신이 작성한 리뷰만 접근할 수 있습니다.");
    }

    @Test
    @DisplayName("리뷰 수정 - 성공")
    void updateReview_Success() {
        // given
        WalkerReviewRequest updateRequest = new WalkerReviewRequest();
        updateRequest.setRating(4);
        updateRequest.setComment("Updated comment");

        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerReviewRepository.findById(1L))
                .willReturn(Optional.of(testReview));
        given(walkerReviewRepository.save(any(WalkerReview.class)))
                .willReturn(testReview);

        // when
        WalkerReviewResponse response = walkerReviewService.updateReview(1L, testUsername, updateRequest);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);

        verify(userRepository).findByUsername(testUsername);
        verify(walkerReviewRepository).findById(1L);
        verify(walkerReviewRepository).save(testReview);
    }

    @Test
    @DisplayName("리뷰 삭제 - 성공")
    void deleteReview_Success() {
        // given
        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerReviewRepository.findById(1L))
                .willReturn(Optional.of(testReview));

        // when
        walkerReviewService.deleteReview(1L, testUsername);

        // then
        verify(userRepository).findByUsername(testUsername);
        verify(walkerReviewRepository).findById(1L);
        verify(walkerReviewRepository).delete(testReview);
    }

    @Test
    @DisplayName("리뷰 작성 가능한 예약 목록 조회 - 성공")
    void getReviewableBookings_Success() {
        // given
        List<WalkerBooking> completedBookings = Arrays.asList(testBooking);

        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerBookingRepository.findByUserIdAndStatus(1L, WalkerBooking.BookingStatus.COMPLETED))
                .willReturn(completedBookings);
        given(walkerReviewRepository.existsByBookingId(1L))
                .willReturn(false);

        // when
        List<Map<String, Object>> result = walkerReviewService.getReviewableBookings(testUsername);

        // then
        assertThat(result).hasSize(1);
        Map<String, Object> bookingInfo = result.get(0);
        assertThat(bookingInfo).containsKey("bookingId");
        assertThat(bookingInfo).containsKey("walkerId");
        assertThat(bookingInfo).containsKey("date");
        assertThat(bookingInfo).containsKey("duration");
        assertThat(bookingInfo.get("bookingId")).isEqualTo(1L);
        assertThat(bookingInfo.get("walkerId")).isEqualTo(1L);

        verify(userRepository).findByUsername(testUsername);
        verify(walkerBookingRepository).findByUserIdAndStatus(1L, WalkerBooking.BookingStatus.COMPLETED);
        verify(walkerReviewRepository).existsByBookingId(1L);
    }

    @Test
    @DisplayName("리뷰 작성 가능한 예약 목록 조회 - 이미 리뷰가 작성된 예약은 제외")
    void getReviewableBookings_ExcludeReviewedBookings() {
        // given
        List<WalkerBooking> completedBookings = Arrays.asList(testBooking);

        given(userRepository.findByUsername(testUsername))
                .willReturn(Optional.of(testUser));
        given(walkerBookingRepository.findByUserIdAndStatus(1L, WalkerBooking.BookingStatus.COMPLETED))
                .willReturn(completedBookings);
        given(walkerReviewRepository.existsByBookingId(1L))
                .willReturn(true); // 이미 리뷰가 작성됨

        // when
        List<Map<String, Object>> result = walkerReviewService.getReviewableBookings(testUsername);

        // then
        assertThat(result).isEmpty();

        verify(userRepository).findByUsername(testUsername);
        verify(walkerBookingRepository).findByUserIdAndStatus(1L, WalkerBooking.BookingStatus.COMPLETED);
        verify(walkerReviewRepository).existsByBookingId(1L);
    }

    @Test
    @DisplayName("null 값으로 평균 평점 조회 시 반올림 처리")
    void getWalkerAverageRating_RoundingTest() {
        // given
        given(walkerProfileRepository.findById(1L))
                .willReturn(Optional.of(testWalker));
        given(walkerReviewRepository.findAverageRatingByWalkerId(1L))
                .willReturn(4.56789);
        given(walkerReviewRepository.countByWalkerId(1L))
                .willReturn(5L);

        // when
        Map<String, Object> result = walkerReviewService.getWalkerAverageRating(1L);

        // then
        assertThat(result.get("averageRating")).isEqualTo(4.6); // 반올림 확인
    }
}