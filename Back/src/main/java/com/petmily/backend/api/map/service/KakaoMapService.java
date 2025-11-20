package com.petmily.backend.api.map.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.map.dto.AddressInfo;
import com.petmily.backend.api.map.dto.Coord;
import com.petmily.backend.api.map.dto.KakaoAddressResponse;
import com.petmily.backend.api.map.dto.KakaoCoordResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoMapService {

    @Value("${kakao.map.api.key}")
    private String kakaoApiKey;

    private final RestTemplate restTemplate;

    private static final String KAKAO_GEOCODE_URL = "https://dapi.kakao.com/v2/local/search/address.json";
    private static final String KAKAO_REVERSE_GEOCODE_URL = "https://dapi.kakao.com/v2/local/geo/coord2address.json";

    /**
     * 주소 -> 좌표 변환 (Geocoding)
     */
    public Coord geocodeAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Address cannot be empty for geocoding.");
        }

        URI uri = UriComponentsBuilder.fromUriString(KAKAO_GEOCODE_URL)
                .queryParam("query", address)
                .build()
                .encode()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "KakaoAK " + kakaoApiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<KakaoCoordResponse> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    entity,
                    KakaoCoordResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().getDocuments().isEmpty()) {
                KakaoCoordResponse.Document document = response.getBody().getDocuments().get(0);
                return new Coord(Double.parseDouble(document.getY()), Double.parseDouble(document.getX()));
            } else {
                log.warn("Kakao geocoding failed for address: {}. Response: {}", address, response.getStatusCode());
                throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Could not geocode address: " + address);
            }
        } catch (Exception e) {
            log.error("Error during Kakao geocoding for address: {}", address, e);
            throw new CustomException(ErrorCode.INTERNAL_ERROR, "Failed to geocode address: " + address);
        }
    }

    /**
     * 좌표 -> 주소 변환 (Reverse Geocoding)
     */
    public AddressInfo reverseGeocode(double latitude, double longitude) {
        URI uri = UriComponentsBuilder.fromUriString(KAKAO_REVERSE_GEOCODE_URL)
                .queryParam("x", longitude)
                .queryParam("y", latitude)
                .build()
                .encode()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "KakaoAK " + kakaoApiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<KakaoAddressResponse> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    entity,
                    KakaoAddressResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() &&
                    response.getBody() != null &&
                    !response.getBody().getDocuments().isEmpty()) {
                KakaoAddressResponse.Document document = response.getBody().getDocuments().get(0);
                return buildAddressInfo(document);
            } else {
                log.warn("Kakao reverse geocoding failed for coord: ({}, {}). Response: {}",
                        latitude, longitude, response.getStatusCode());
                throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Could not reverse geocode coordinates: " + latitude + ", " + longitude);
            }
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error during Kakao reverse geocoding for coord: ({}, {})", latitude, longitude, e);
            throw new CustomException(ErrorCode.INTERNAL_ERROR,
                    "Failed to reverse geocode coordinates: " + latitude + ", " + longitude);
        }
    }

    private AddressInfo buildAddressInfo(KakaoAddressResponse.Document document){
        String roadAddress = null;
        String jibunAddress = null;
        String region1depth = null;
        String region2depth = null;
        String region3depth = null;
        String buildingName = null;

        if(document.getRoadAddress() != null) {
            KakaoAddressResponse.RoadAddress road = document.getRoadAddress();
            roadAddress = road.getAddressName();
            region1depth = road.getRegion1depthName();
            region2depth = road.getRegion2depthName();
            region3depth = road.getRegion3depthName();
            buildingName = road.getBuildingName();
        }

        if(document.getAddress() != null){
            KakaoAddressResponse.Address jibun = document.getAddress();
            jibunAddress = jibun.getAddressName();

            if(roadAddress == null) {
                region1depth = jibun.getRegion1depthName();
                region2depth = jibun.getRegion2depthName();
                region3depth = jibun.getRegion3depthName();
            }
        }

        return AddressInfo.builder()
                .roadAddress(roadAddress)
                .jibunAddress(jibunAddress)
                .region1depth(region1depth)
                .region2depth(region2depth)
                .region3depth(region3depth)
                .buildingName(buildingName)
                .build();
    }
}
