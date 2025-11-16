package com.petmily.backend.api.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressInfo {

    private String roadAddress;     // 도로명 주소
    private String jibunAddress;    // 지번 주소
    private String region1depth;    // 시 도
    private String region2depth;    // 시 군 구
    private String region3depth;    // 읍 면 동
    private String buildingName;    // 건물명

    /**
     * 도로명 주소가 있다면 도로명, 없으면 지번 주소 반환
     */
    public String getPreferredAddress() {
        return roadAddress != null && !roadAddress.isEmpty() ? roadAddress : jibunAddress;
    }

    /**
     * 간단한 주소 (시 군 구 + 읍 면 동)
     */
    public String getShortAddress(){
        StringBuilder sb = new StringBuilder();
        if(region2depth != null && !region2depth.isEmpty()){
            sb.append(region2depth).append(" ");
        }
        if(region3depth != null && !region3depth.isEmpty()){
            sb.append(region3depth);
        }
        return sb.toString().trim();
    }

}
