package com.petmily.backend.api.dashboard.controller;

import com.petmily.backend.api.auth.jwt.JwtTokenProvider;
import com.petmily.backend.api.auth.oauth.CustomOAuth2UserService;
import com.petmily.backend.api.auth.handler.OAuth2SuccessHandler;
import com.petmily.backend.api.dashboard.dto.DashboardResponse;
import com.petmily.backend.api.dashboard.service.DashboardService;
import com.petmily.backend.api.pet.dto.PetSummaryResponse;
import com.petmily.backend.api.walker.dto.walkerBooking.WalkerBookingResponse;
import com.petmily.backend.api.walker.dto.WalkerSummaryResponse;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomOAuth2UserService customOAuth2UserService;

    @MockBean
    private OAuth2SuccessHandler oAuth2SuccessHandler;


    private DashboardResponse mockDashboardResponse;

    @BeforeEach
    void setUp() {
        // Mock pets
        List<PetSummaryResponse> mockPets = Arrays.asList(
                PetSummaryResponse.builder()
                        .id(1L)
                        .name("코코")
                        .species("개")
                        .breed("골든 리트리버")
                        .age("3")
                        .imageUrl("https://example.com/coco.jpg")
                        .size(Pet.Size.MEDIUM)
                        .build(),
                PetSummaryResponse.builder()
                        .id(2L)
                        .name("냥이")
                        .species("고양이")
                        .breed("페르시안")
                        .age("2")
                        .imageUrl("https://example.com/cat.jpg")
                        .size(Pet.Size.SMALL)
                        .build()
        );

        // Mock active bookings
        List<WalkerBookingResponse> mockBookings = Arrays.asList(
                WalkerBookingResponse.builder()
                        .id(1L)
                        .petId(1L)
                        .walkerId(1L)
                        .date(LocalDateTime.now().plusDays(1))
                        .duration(60)
                        .status(WalkerBooking.BookingStatus.CONFIRMED)
                        .totalPrice(30000.0)
                        .build()
        );

        // Mock nearby walkers
        List<WalkerSummaryResponse> mockWalkers = Arrays.asList(
                WalkerSummaryResponse.builder()
                        .id(1L)
                        .username("walker1")
                        .name("김워커")
                        .profileImageUrl("https://example.com/walker1.jpg")
                        .location("강남구")
                        .rating(4.8)
                        .totalWalks(150)
                        .pricePerHour(25000.0)
                        .status(WalkerStatus.ACTIVE)
                        .isAvailable(true)
                        .build(),
                WalkerSummaryResponse.builder()
                        .id(2L)
                        .username("walker2")
                        .name("이워커")
                        .profileImageUrl("https://example.com/walker2.jpg")
                        .location("서초구")
                        .rating(4.9)
                        .totalWalks(200)
                        .pricePerHour(30000.0)
                        .status(WalkerStatus.ACTIVE)
                        .isAvailable(true)
                        .build()
        );

        // Mock stats
        DashboardResponse.QuickStats mockStats = DashboardResponse.QuickStats.builder()
                .totalPets(2)
                .upcomingBookings(1)
                .completedWalks(5)
                .totalSpent(150000.0)
                .build();

        mockDashboardResponse = DashboardResponse.builder()
                .myPets(mockPets)
                .activeBookings(mockBookings)
                .nearbyWalkers(mockWalkers)
                .stats(mockStats)
                .build();
    }

    @Test
    @WithMockUser(username = "testuser")
    void getDashboard_Success() throws Exception {
        when(dashboardService.getDashboard("testuser")).thenReturn(mockDashboardResponse);

        mockMvc.perform(get("/api/dashboard")
                .accept(MediaType.APPLICATION_JSON))
                .andDo(result -> {
                    System.out.println("Response status: " + result.getResponse().getStatus());
                    System.out.println("Response body: " + result.getResponse().getContentAsString());
                    System.out.println("Response headers: " + result.getResponse().getHeaderNames());
                    System.out.println("Content type: " + result.getResponse().getContentType());
                })
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.myPets").isArray());
                
        verify(dashboardService).getDashboard("testuser");
    }

    @Test
    void getDashboard_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isUnauthorized());
    }
}