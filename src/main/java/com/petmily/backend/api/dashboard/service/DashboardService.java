package com.petmily.backend.api.dashboard.service;

import com.petmily.backend.api.dashboard.dto.DashboardResponse;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.pet.dto.PetSummaryResponse;
import com.petmily.backend.api.walker.dto.walkerBooking.WalkerBookingResponse;
import com.petmily.backend.api.walker.dto.WalkerSummaryResponse;
import com.petmily.backend.domain.pet.repository.PetRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import com.petmily.backend.domain.walker.repository.WalkerBookingRepository;
import com.petmily.backend.domain.walker.repository.WalkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final WalkerBookingRepository walkerBookingRepository;
    private final WalkerProfileRepository walkerProfileRepository;
    
    public DashboardResponse getDashboard(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        // Get user's pets (최대 3개만)
        List<PetSummaryResponse> myPets = petRepository.findByUserIdOrderByCreateTimeDesc(user.getId())
                .stream()
                .limit(3)
                .map(PetSummaryResponse::from)
                .collect(Collectors.toList());
        
        // Get active bookings
        List<WalkerBookingResponse> activeBookings = walkerBookingRepository
                .findByUserIdAndStatusIn(user.getId(), 
                        List.of(WalkerBooking.BookingStatus.PENDING, 
                               WalkerBooking.BookingStatus.CONFIRMED, 
                               WalkerBooking.BookingStatus.IN_PROGRESS))
                .stream()
                .map(WalkerBookingResponse::from)
                .collect(Collectors.toList());
        
        // Get nearby available walkers (최대 5개만)
        List<WalkerSummaryResponse> nearbyWalkers = walkerProfileRepository
                .findByIsAvailableTrue()
                .stream()
                .limit(5)
                .map(WalkerSummaryResponse::from)
                .collect(Collectors.toList());
        
        // Calculate quick stats
        int totalPets = petRepository.findByUserId(user.getId()).size();
        int upcomingBookings = walkerBookingRepository
                .findByUserIdAndStatusIn(user.getId(), 
                        List.of(WalkerBooking.BookingStatus.PENDING, 
                               WalkerBooking.BookingStatus.CONFIRMED)).size();
        int completedWalks = walkerBookingRepository
                .findByUserIdAndStatus(user.getId(), WalkerBooking.BookingStatus.COMPLETED).size();
        Double totalSpent = walkerBookingRepository
                .findByUserIdAndStatus(user.getId(), WalkerBooking.BookingStatus.COMPLETED)
                .stream()
                .mapToDouble(WalkerBooking::getTotalPrice)
                .sum();
        
        DashboardResponse.QuickStats stats = DashboardResponse.QuickStats.builder()
                .totalPets(totalPets)
                .upcomingBookings(upcomingBookings)
                .completedWalks(completedWalks)
                .totalSpent(totalSpent)
                .build();
        
        return DashboardResponse.builder()
                .myPets(myPets)
                .activeBookings(activeBookings)
                .nearbyWalkers(nearbyWalkers)
                .stats(stats)
                .build();
    }
}