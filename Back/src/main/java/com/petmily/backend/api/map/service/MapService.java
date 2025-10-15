package com.petmily.backend.api.map.service;

import com.petmily.backend.api.map.dto.LocationRequest;
import com.petmily.backend.api.map.dto.LocationResponse;
import com.petmily.backend.api.map.dto.MapConfigResponse;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MapService {
    
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    
    @Value("${kakao.map.api.key}")
    private String kakaoMapApiKey;
    
    public MapService(UserRepository userRepository, PetRepository petRepository) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
    }
    
    public MapConfigResponse getMapConfig() {
        MapConfigResponse config = new MapConfigResponse();
        config.setKakaoMapApiKey(kakaoMapApiKey);
        config.setMapCenterLat("37.5665"); // 서울 중심
        config.setMapCenterLon("126.9780");
        config.setMapZoomLevel(15);
        return config;
    }
    
    public LocationResponse updateUserLocation(LocationRequest request) {
        // 실제 구현에서는 위치 정보를 데이터베이스에 저장
        // 여기서는 요청된 정보를 그대로 반환
        LocationResponse response = new LocationResponse();
        response.setLatitude(request.getLatitude());
        response.setLongitude(request.getLongitude());
        response.setTimestamp(request.getTimestamp());
        response.setUserId(request.getUserId());
        
        // 사용자의 반려동물 정보 조회
        User user = userRepository.findByEmail(request.getUserId()).orElse(null);
        if (user != null) {
            List<Pet> pets = petRepository.findByUserId(user.getId());
            if (!pets.isEmpty()) {
                Pet pet = pets.get(0); // 첫 번째 반려동물 사용
                response.setPetProfileImage(pet.getPhotoUri());
                response.setPetName(pet.getName());
                response.setPetSpecies(pet.getSpecies());
            }
        }
        
        return response;
    }
    
    public List<LocationResponse> getActiveUserLocations() {
        // 실제 구현에서는 활성 사용자들의 위치 정보를 반환
        // 여기서는 샘플 데이터 반환
        return List.of();
    }
}
