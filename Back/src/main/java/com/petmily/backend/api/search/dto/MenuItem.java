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
public class MenuItem {

    private String id;
    private String title;
    private String description;
    private String category;
    private String route;
    private String icon;
    private List<String> keywords;
}

