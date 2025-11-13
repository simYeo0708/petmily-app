package com.petmily.backend.api.search.service;

import com.petmily.backend.api.search.dto.SearchResultItem;

import java.util.List;

public interface SearchStrategy {

    String getSearchType();

    List<SearchResultItem> search(String query);

    List<String> autocomplete(String query);

    default boolean isEnabled() {
        return true;
    }
}

