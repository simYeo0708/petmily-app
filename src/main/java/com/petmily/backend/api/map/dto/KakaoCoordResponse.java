package com.petmily.backend.api.map.dto;

import lombok.Data;
import java.util.List;

@Data
public class KakaoCoordResponse {
    private List<Document> documents;

    @Data
    public static class Document {
        private String address_name;
        private String y; // latitude
        private String x; // longitude
        private String address_type;
    }
}
