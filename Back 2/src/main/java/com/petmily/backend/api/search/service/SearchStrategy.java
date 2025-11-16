package com.petmily.backend.api.search.service;

import com.petmily.backend.api.search.dto.SearchResultItem;

import java.util.List;

public interface SearchStrategy {

    String getSearchType();

    List<SearchResultItem> search(String query);

    List<String> autocomplete(String query);

    // 이 검색 타입이 활성화되어 있는지 여부
    default boolean isEnabled(){
        return true;
    }

}
