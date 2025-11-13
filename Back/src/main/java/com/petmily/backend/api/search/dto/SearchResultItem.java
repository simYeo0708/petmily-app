package com.petmily.backend.api.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultItem {

    private String type;
    private String id;
    private String title;
    private String subtitle;
    private String description;
    private String imageUrl;
    private String route;
    private Map<String, Object> metadata;
}

