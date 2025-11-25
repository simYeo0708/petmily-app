package com.petmily.backend.api.map.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class KakaoAddressResponse {

    private Meta meta;
    private List<Document> documents;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Meta{
        @JsonProperty("total_count")
        private Integer totalCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Document{
        @JsonProperty("road_address")
        private RoadAddress roadAddress;

        private Address address;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class RoadAddress{
        @JsonProperty("address_name")
        private String addressName;         // 전체 도로명 주소

        @JsonProperty("region_1depth_name")
        private String region1depthName;    // 시 도

        @JsonProperty("region_2depth_name")
        private String region2depthName;    // 시 군 구

        @JsonProperty("region_3depth_name")
        private String region3depthName;    // 읍 면 동

        @JsonProperty("road_name")
        private String roadName;            // 도로명

        @JsonProperty("underground_yn")
        private String undergroundYn;       // 지하 여부

        @JsonProperty("main_building_no")
        private String mainBuildingNo;      // 건물 본번

        @JsonProperty("sub_building_no")
        private String subBuildingNo;       // 건물 부번

        @JsonProperty("building_name")
        private String buildingName;        // 건물명

        @JsonProperty("zone_no")
        private String zoneNo;              // 우편번호
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Address{
        @JsonProperty("address_name")
        private String addressName;         // 전체 지번 주소

        @JsonProperty("region_1depth_name")
        private String region1depthName;    // 시 도

        @JsonProperty("region_2depth_name")
        private String region2depthName;    // 시 군 구

        @JsonProperty("region_3depth_name")
        private String region3depthName;    // 읍 면 동

        @JsonProperty("region_3depth_h_name")
        private String region3depthHName;   // 행 정 동

        @JsonProperty("h_code")
        private String hCode;               // 행정 코드

        @JsonProperty("b_code")
        private String bCode;               // 법정 코드

        @JsonProperty("mountain_yn")
        private String mountainYn;          // 산 여부

        @JsonProperty("main_address_no")
        private String mainAddressNo;       // 지번 주번지

        @JsonProperty("sub_address_no")
        private String subAddressNo;        // 지번 부번지

        @JsonProperty("zip_code")
        private String zipCode;             // 우편번호
    }

}
