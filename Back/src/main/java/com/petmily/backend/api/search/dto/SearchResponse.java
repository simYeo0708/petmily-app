package com.petmily.backend.api.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResponse {
    private String query;   // 검색어
    private Map<String, List<SearchResultItem>> results;
    private List<String> suggestions;
    private Integer totalCount;
}
