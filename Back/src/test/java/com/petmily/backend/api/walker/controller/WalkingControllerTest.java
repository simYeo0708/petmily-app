package com.petmily.backend.api.walker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmily.backend.api.walker.dto.walking.*;
import com.petmily.backend.api.walker.dto.walkerBooking.WalkerBookingResponse;
import com.petmily.backend.api.walker.service.WalkingService;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import com.petmily.backend.domain.walker.entity.WalkingTrack;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WalkingController.class)
class WalkingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WalkingService walkingService;

    @Autowired
    private ObjectMapper objectMapper;

    private WalkerBookingResponse mockBookingResponse;
    private WalkingTrackResponse mockTrackResponse;
    private LocationTrackRequest mockTrackRequest;
    private LocationUpdateRequest mockLocationRequest;

    @BeforeEach
    void setUp() {
        mockBookingResponse = WalkerBookingResponse.builder()
                .id(1L)
                .userId(1L)
                .walkerId(2L)
                .petId(1L)
                .status(WalkerBooking.BookingStatus.IN_PROGRESS)
                .totalPrice(30000.0)
                .duration(60)
                .notes("테스트 산책")
                .build();

        mockTrackResponse = WalkingTrackResponse.builder()
                .id(1L)
                .bookingId(1L)
                .latitude(37.5665)  // 서울시청 좌표
                .longitude(126.9780)
                .timestamp(LocalDateTime.now())
                .accuracy(5.0)
                .trackType(WalkingTrack.TrackType.WALKING)
                .build();

        mockTrackRequest = new LocationTrackRequest();
        mockTrackRequest.setLatitude(37.5665);
        mockTrackRequest.setLongitude(126.9780);
        mockTrackRequest.setTimestamp(LocalDateTime.now());
        mockTrackRequest.setAccuracy(5.0);
        mockTrackRequest.setTrackType(WalkingTrack.TrackType.WALKING);

        mockLocationRequest = new LocationUpdateRequest();
        mockLocationRequest.setLatitude(37.5665);
        mockLocationRequest.setLongitude(126.9780);
        // mockLocationRequest doesn't have address field
    }

    @Test
    @WithMockUser(username = "walker1", roles = {"USER"})
    void startWalk_Success() throws Exception {
        when(walkingService.startWalk(eq(1L), eq("walker1")))
                .thenReturn(mockBookingResponse);

        mockMvc.perform(post("/api/walking/1/start")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @WithMockUser(username = "walker1", roles = {"USER"})
    void completeWalk_Success() throws Exception {
        WalkerBookingResponse completedBooking = WalkerBookingResponse.builder()
                .id(1L)
                .status(WalkerBooking.BookingStatus.COMPLETED)
                .build();

        when(walkingService.completeWalk(eq(1L), any(WalkingEndRequest.class), eq("walker1")))
                .thenReturn(completedBooking);

        WalkingEndRequest request = WalkingEndRequest.builder()
                .specialNotes("테스트 특이사항")
                .walkingSummary("정상적인 산책 완료")
                .build();

        mockMvc.perform(post("/api/walking/1/complete")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @WithMockUser(username = "walker1", roles = {"USER"})
    void saveWalkingTrack_WithValidCoordinates_Success() throws Exception {
        when(walkingService.saveWalkingTrack(eq(1L), any(LocationTrackRequest.class), eq("walker1")))
                .thenReturn(mockTrackResponse);

        mockMvc.perform(post("/api/walking/1/track")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockTrackRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(1L))
                .andExpect(jsonPath("$.latitude").value(37.5665))
                .andExpect(jsonPath("$.longitude").value(126.9780))
                .andExpect(jsonPath("$.trackType").value("WALKING"));
    }

    @Test
    @WithMockUser(username = "walker1", roles = {"USER"})
    void saveWalkingTrack_WithInvalidCoordinates_ShouldHandleValidation() throws Exception {
        LocationTrackRequest invalidRequest = new LocationTrackRequest();
        invalidRequest.setLatitude(200.0); // Invalid latitude
        invalidRequest.setLongitude(300.0); // Invalid longitude
        invalidRequest.setTimestamp(LocalDateTime.now());

        mockMvc.perform(post("/api/walking/1/track")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "user1", roles = {"USER"})
    void getWalkingPath_Success() throws Exception {
        WalkingPathResponse pathResponse = WalkingPathResponse.builder()
                .bookingId(1L)
                .trackPoints(Arrays.asList(mockTrackResponse))
                .statistics(WalkingPathResponse.WalkingStatistics.builder()
                        .totalDistance(2.5)
                        .totalDuration(60L)
                        .averageSpeed(2.5)
                        .totalPoints(10)
                        .walkingRoute("공원 산책 코스")
                        .build())
                .build();

        when(walkingService.getWalkingPath(eq(1L), eq("user1")))
                .thenReturn(pathResponse);

        mockMvc.perform(get("/api/walking/1/path")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(1L))
                .andExpect(jsonPath("$.trackPoints").isArray())
                .andExpect(jsonPath("$.trackPoints[0].latitude").value(37.5665))
                .andExpect(jsonPath("$.trackPoints[0].longitude").value(126.9780))
                .andExpect(jsonPath("$.statistics.totalDistance").value(2.5))
                .andExpect(jsonPath("$.statistics.totalDuration").value(60));
    }

    @Test
    @WithMockUser(username = "user1", roles = {"USER"})
    void getRealtimeLocation_Success() throws Exception {
        List<WalkingTrackResponse> trackResponses = Arrays.asList(
            WalkingTrackResponse.builder()
                .id(1L)
                .bookingId(1L)
                .latitude(37.5665)
                .longitude(126.9780)
                .timestamp(LocalDateTime.now())
                .build(),
            WalkingTrackResponse.builder()
                .id(2L)
                .bookingId(1L)
                .latitude(37.5670)
                .longitude(126.9785)
                .timestamp(LocalDateTime.now().plusMinutes(1))
                .build()
        );

        when(walkingService.getRealtimeLocation(eq(1L), any(LocalDateTime.class), eq("user1")))
                .thenReturn(trackResponses);

        mockMvc.perform(get("/api/walking/1/realtime")
                        .param("afterTime", LocalDateTime.now().minusMinutes(5).toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].latitude").value(37.5665))
                .andExpect(jsonPath("$[1].latitude").value(37.5670));
    }

    @Test
    @WithMockUser(username = "walker1", roles = {"USER"})
    void updateLocation_WithKakaoMapCoordinates_Success() throws Exception {
        when(walkingService.updateLocation(eq(1L), any(LocationUpdateRequest.class), eq("walker1")))
                .thenReturn(mockBookingResponse);

        mockMvc.perform(put("/api/walking/1/location")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockLocationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(username = "walker1", roles = {"USER"})
    void uploadPhoto_Success() throws Exception {
        PhotoUploadRequest photoRequest = new PhotoUploadRequest();
        photoRequest.setPhotoUrl("https://example.com/photo1.jpg");
        photoRequest.setPhotoType("START");
        photoRequest.setLocation("서울특별시 중구 태평로1가");

        when(walkingService.uploadPhoto(eq(1L), any(PhotoUploadRequest.class), eq("walker1")))
                .thenReturn(mockBookingResponse);

        mockMvc.perform(put("/api/walking/1/photos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(photoRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(username = "walker1", roles = {"USER"})
    void uploadPhoto_InvalidPhotoType_ShouldReturnBadRequest() throws Exception {
        PhotoUploadRequest invalidRequest = new PhotoUploadRequest();
        invalidRequest.setPhotoUrl("https://example.com/photo1.jpg");
        invalidRequest.setPhotoType("INVALID_TYPE");

        mockMvc.perform(put("/api/walking/1/photos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "walker1", roles = {"USER"})
    void trackingLocation_WithMultipleCoordinates_ShouldValidateSequence() throws Exception {
        // 첫 번째 위치 (서울시청)
        LocationTrackRequest firstLocation = new LocationTrackRequest();
        firstLocation.setLatitude(37.5665);
        firstLocation.setLongitude(126.9780);
        firstLocation.setTimestamp(LocalDateTime.now());
        firstLocation.setTrackType(WalkingTrack.TrackType.WALKING);

        when(walkingService.saveWalkingTrack(eq(1L), any(LocationTrackRequest.class), eq("walker1")))
                .thenReturn(WalkingTrackResponse.builder()
                        .id(1L)
                        .bookingId(1L)
                        .latitude(firstLocation.getLatitude())
                        .longitude(firstLocation.getLongitude())
                        .timestamp(firstLocation.getTimestamp())
                        .build());

        mockMvc.perform(post("/api/walking/1/track")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstLocation)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.latitude").value(37.5665));

        // 두 번째 위치 (약간 이동한 좌표)
        LocationTrackRequest secondLocation = new LocationTrackRequest();
        secondLocation.setLatitude(37.5670);
        secondLocation.setLongitude(126.9785);
        secondLocation.setTimestamp(LocalDateTime.now().plusMinutes(1));
        secondLocation.setTrackType(WalkingTrack.TrackType.WALKING);

        when(walkingService.saveWalkingTrack(eq(1L), any(LocationTrackRequest.class), eq("walker1")))
                .thenReturn(WalkingTrackResponse.builder()
                        .id(2L)
                        .bookingId(1L)
                        .latitude(secondLocation.getLatitude())
                        .longitude(secondLocation.getLongitude())
                        .timestamp(secondLocation.getTimestamp())
                        .build());

        mockMvc.perform(post("/api/walking/1/track")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondLocation)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.latitude").value(37.5670));
    }
}