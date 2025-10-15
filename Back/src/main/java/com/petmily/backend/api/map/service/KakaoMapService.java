package com.petmily.backend.api.map.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.map.dto.Coord;
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
}
