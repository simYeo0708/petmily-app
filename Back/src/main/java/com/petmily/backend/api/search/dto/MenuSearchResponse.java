package com.petmily.backend.api.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuSearchResponse {

    private String query;
    private List<MenuItem> results;
    private List<String> suggestions;
    private Integer totalCount;
}


