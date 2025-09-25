package com.petmily.backend.api.map.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.map.dto.Coord;
import com.petmily.backend.api.map.dto.KakaoCoordResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Arrays;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KakaoMapServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private KakaoMapService kakaoMapService;

    private KakaoCoordResponse mockSuccessResponse;
    private KakaoCoordResponse mockEmptyResponse;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(kakaoMapService, "kakaoApiKey", "test-api-key");

        KakaoCoordResponse.Document document = new KakaoCoordResponse.Document();
        document.setAddress_name("서울특별시 중구 태평로1가");
        document.setY("37.5665"); // latitude
        document.setX("126.9780"); // longitude
        document.setAddress_type("REGION_ADDR");

        mockSuccessResponse = new KakaoCoordResponse();
        mockSuccessResponse.setDocuments(Arrays.asList(document));

        mockEmptyResponse = new KakaoCoordResponse();
        mockEmptyResponse.setDocuments(Collections.emptyList());
    }

    @Test
    void geocodeAddress_WithValidAddress_ShouldReturnCorrectCoordinates() {
        String address = "서울특별시 중구 태평로1가";

        when(restTemplate.exchange(
                any(URI.class),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(KakaoCoordResponse.class)
        )).thenReturn(new ResponseEntity<>(mockSuccessResponse, HttpStatus.OK));

        Coord result = kakaoMapService.geocodeAddress(address);

        assertThat(result).isNotNull();
        assertThat(result.getLatitude()).isEqualTo(37.5665);
        assertThat(result.getLongitude()).isEqualTo(126.9780);
    }

    @Test
    void geocodeAddress_WithGangnamAddress_ShouldReturnGangnamCoordinates() {
        String address = "서울특별시 강남구 테헤란로 152";

        KakaoCoordResponse.Document gangnamDocument = new KakaoCoordResponse.Document();
        gangnamDocument.setAddress_name("서울특별시 강남구 테헤란로 152");
        gangnamDocument.setY("37.5009"); // 강남구 좌표
        gangnamDocument.setX("127.0395");

        KakaoCoordResponse gangnamResponse = new KakaoCoordResponse();
        gangnamResponse.setDocuments(Arrays.asList(gangnamDocument));

        when(restTemplate.exchange(
                any(URI.class),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(KakaoCoordResponse.class)
        )).thenReturn(new ResponseEntity<>(gangnamResponse, HttpStatus.OK));

        Coord result = kakaoMapService.geocodeAddress(address);

        assertThat(result).isNotNull();
        assertThat(result.getLatitude()).isEqualTo(37.5009);
        assertThat(result.getLongitude()).isEqualTo(127.0395);
    }

    @Test
    void geocodeAddress_WithEmptyAddress_ShouldThrowException() {
        assertThatThrownBy(() -> kakaoMapService.geocodeAddress(""))
                .isInstanceOf(CustomException.class)
                .hasMessage("Address cannot be empty for geocoding.");
    }

    @Test
    void geocodeAddress_WithNullAddress_ShouldThrowException() {
        assertThatThrownBy(() -> kakaoMapService.geocodeAddress(null))
                .isInstanceOf(CustomException.class)
                .hasMessage("Address cannot be empty for geocoding.");
    }

    @Test
    void geocodeAddress_WithInvalidAddress_ShouldThrowNotFoundException() {
        String invalidAddress = "존재하지않는주소";

        when(restTemplate.exchange(
                any(URI.class),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(KakaoCoordResponse.class)
        )).thenReturn(new ResponseEntity<>(mockEmptyResponse, HttpStatus.OK));

        assertThatThrownBy(() -> kakaoMapService.geocodeAddress(invalidAddress))
                .isInstanceOf(CustomException.class);
    }

    @Test
    void geocodeAddress_WhenKakaoApiReturnsError_ShouldThrowInternalError() {
        String address = "서울특별시 중구 태평로1가";

        when(restTemplate.exchange(
                any(URI.class),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(KakaoCoordResponse.class)
        )).thenThrow(new RestClientException("API Error"));

        assertThatThrownBy(() -> kakaoMapService.geocodeAddress(address))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("Failed to geocode address");
    }

    @Test
    void geocodeAddress_WithMultipleResults_ShouldReturnFirstResult() {
        String address = "서울특별시 중구";

        KakaoCoordResponse.Document firstDoc = new KakaoCoordResponse.Document();
        firstDoc.setY("37.5665");
        firstDoc.setX("126.9780");

        KakaoCoordResponse.Document secondDoc = new KakaoCoordResponse.Document();
        secondDoc.setY("37.5600");
        secondDoc.setX("126.9700");

        KakaoCoordResponse multipleResults = new KakaoCoordResponse();
        multipleResults.setDocuments(Arrays.asList(firstDoc, secondDoc));

        when(restTemplate.exchange(
                any(URI.class),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(KakaoCoordResponse.class)
        )).thenReturn(new ResponseEntity<>(multipleResults, HttpStatus.OK));

        Coord result = kakaoMapService.geocodeAddress(address);

        assertThat(result).isNotNull();
        assertThat(result.getLatitude()).isEqualTo(37.5665);
        assertThat(result.getLongitude()).isEqualTo(126.9780);
    }

    @Test
    void geocodeAddress_WithSeoulStationAddress_ShouldReturnSeoulStationCoordinates() {
        String address = "서울특별시 용산구 한강대로 405";

        KakaoCoordResponse.Document seoulStationDoc = new KakaoCoordResponse.Document();
        seoulStationDoc.setAddress_name("서울특별시 용산구 한강대로 405");
        seoulStationDoc.setY("37.5547"); // 서울역 좌표
        seoulStationDoc.setX("126.9707");

        KakaoCoordResponse seoulStationResponse = new KakaoCoordResponse();
        seoulStationResponse.setDocuments(Arrays.asList(seoulStationDoc));

        when(restTemplate.exchange(
                any(URI.class),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(KakaoCoordResponse.class)
        )).thenReturn(new ResponseEntity<>(seoulStationResponse, HttpStatus.OK));

        Coord result = kakaoMapService.geocodeAddress(address);

        assertThat(result).isNotNull();
        assertThat(result.getLatitude()).isEqualTo(37.5547);
        assertThat(result.getLongitude()).isEqualTo(126.9707);

        // 서울 지역 좌표 범위 검증
        assertThat(result.getLatitude()).isBetween(37.4, 37.7);
        assertThat(result.getLongitude()).isBetween(126.7, 127.2);
    }

    @Test
    void geocodeAddress_WithBusanAddress_ShouldReturnBusanCoordinates() {
        String address = "부산광역시 해운대구 해운대해변로 264";

        KakaoCoordResponse.Document busanDoc = new KakaoCoordResponse.Document();
        busanDoc.setAddress_name("부산광역시 해운대구 해운대해변로 264");
        busanDoc.setY("35.1588"); // 해운대 좌표
        busanDoc.setX("129.1603");

        KakaoCoordResponse busanResponse = new KakaoCoordResponse();
        busanResponse.setDocuments(Arrays.asList(busanDoc));

        when(restTemplate.exchange(
                any(URI.class),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(KakaoCoordResponse.class)
        )).thenReturn(new ResponseEntity<>(busanResponse, HttpStatus.OK));

        Coord result = kakaoMapService.geocodeAddress(address);

        assertThat(result).isNotNull();
        assertThat(result.getLatitude()).isEqualTo(35.1588);
        assertThat(result.getLongitude()).isEqualTo(129.1603);

        // 부산 지역 좌표 범위 검증
        assertThat(result.getLatitude()).isBetween(34.8, 35.4);
        assertThat(result.getLongitude()).isBetween(128.8, 129.5);
    }

    @Test
    void geocodeAddress_CoordinatePrecision_ShouldHandleDecimalValues() {
        String address = "정밀 좌표 테스트";

        KakaoCoordResponse.Document preciseDoc = new KakaoCoordResponse.Document();
        preciseDoc.setY("37.566535123"); // 높은 정밀도 좌표
        preciseDoc.setX("126.978027456");

        KakaoCoordResponse preciseResponse = new KakaoCoordResponse();
        preciseResponse.setDocuments(Arrays.asList(preciseDoc));

        when(restTemplate.exchange(
                any(URI.class),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(KakaoCoordResponse.class)
        )).thenReturn(new ResponseEntity<>(preciseResponse, HttpStatus.OK));

        Coord result = kakaoMapService.geocodeAddress(address);

        assertThat(result).isNotNull();
        assertThat(result.getLatitude()).isEqualTo(37.566535123);
        assertThat(result.getLongitude()).isEqualTo(126.978027456);
    }
}