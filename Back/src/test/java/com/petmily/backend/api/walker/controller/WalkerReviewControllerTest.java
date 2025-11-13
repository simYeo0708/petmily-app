package com.petmily.backend.api.walker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReviewRequest;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReviewResponse;
import com.petmily.backend.api.walker.service.WalkerReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Disabled("Mall 리팩터링 이후 워커 리뷰 API 테스트 재구성 예정")
class WalkerReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WalkerReviewService walkerReviewService;

    @Autowired
    private ObjectMapper objectMapper;

    private WalkerReviewResponse mockReviewResponse;
    private WalkerReviewRequest mockReviewRequest;

    @BeforeEach
    void setUp() {
        mockReviewResponse = WalkerReviewResponse.builder()
                .id(1L)
                .userId(1L)
                .walkerId(2L)
                .rating(5)
                .comment("Great walker!")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        mockReviewRequest = new WalkerReviewRequest();
        mockReviewRequest.setWalkerId(2L);
        mockReviewRequest.setRating(5);
        mockReviewRequest.setComment("Great walker!");
    }

    @Test
    @WithMockUser(username = "testuser")
    void createReview_Success() throws Exception {
        when(walkerReviewService.createReview(eq("testuser"), any(WalkerReviewRequest.class)))
                .thenReturn(mockReviewResponse);

        mockMvc.perform(post("/api/walker/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockReviewRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Great walker!"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getWalkerReviews_Success() throws Exception {
        List<WalkerReviewResponse> reviews = Arrays.asList(mockReviewResponse);
        when(walkerReviewService.getWalkerReviews(2L)).thenReturn(reviews);

        mockMvc.perform(get("/api/walker/reviews/walker/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].rating").value(5));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getWalkerAverageRating_Success() throws Exception {
        Map<String, Object> averageData = new HashMap<>();
        averageData.put("averageRating", 4.5);
        averageData.put("totalReviews", 10L);

        when(walkerReviewService.getWalkerAverageRating(2L)).thenReturn(averageData);

        mockMvc.perform(get("/api/walker/reviews/walker/2/average"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageRating").value(4.5))
                .andExpect(jsonPath("$.totalReviews").value(10));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getMyReviews_Success() throws Exception {
        List<WalkerReviewResponse> reviews = Arrays.asList(mockReviewResponse);
        when(walkerReviewService.getUserReviews("testuser")).thenReturn(reviews);

        mockMvc.perform(get("/api/walker/reviews/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].rating").value(5));
    }

    @Test
    @WithMockUser(username = "testuser")
    void updateReview_Success() throws Exception {
        WalkerReviewResponse updatedResponse = WalkerReviewResponse.builder()
                .id(1L)
                .userId(1L)
                .walkerId(2L)
                .rating(4)
                .comment("Updated comment")
                .build();

        when(walkerReviewService.updateReview(eq(1L), eq("testuser"), any(WalkerReviewRequest.class)))
                .thenReturn(updatedResponse);

        WalkerReviewRequest updateRequest = new WalkerReviewRequest();
        updateRequest.setWalkerId(2L);
        updateRequest.setRating(4);
        updateRequest.setComment("Updated comment");

        mockMvc.perform(put("/api/walker/reviews/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.comment").value("Updated comment"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void deleteReview_Success() throws Exception {
        mockMvc.perform(delete("/api/walker/reviews/1")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "testuser")
    void getReview_Success() throws Exception {
        when(walkerReviewService.getReview(1L, "testuser")).thenReturn(mockReviewResponse);

        mockMvc.perform(get("/api/walker/reviews/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Great walker!"));
    }
}