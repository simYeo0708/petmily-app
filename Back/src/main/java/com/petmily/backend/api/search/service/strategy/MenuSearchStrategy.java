package com.petmily.backend.api.search.service.strategy;

import com.petmily.backend.api.search.dto.MenuItem;
import com.petmily.backend.api.search.dto.MenuSearchResponse;
import com.petmily.backend.api.search.dto.SearchResultItem;
import com.petmily.backend.api.search.service.MenuSearchService;
import com.petmily.backend.api.search.service.SearchStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MenuSearchStrategy implements SearchStrategy {

    private final MenuSearchService menuSearchService;

    @Override
    public String getSearchType(){
        return "menu";
    }

    @Override
    public List<SearchResultItem> search(String query){
        MenuSearchResponse menuResponse = menuSearchService.searchMenu(query);

        return menuResponse.getResults().stream()
                .map(this::convertToSearchResult)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> autocomplete(String query){
        return menuSearchService.autocomplete(query);
    }

    private SearchResultItem convertToSearchResult(MenuItem menu){
        return SearchResultItem.builder()
                .type(getSearchType())
                .id(menu.getId())
                .title(menu.getTitle())
                .description(menu.getDescription())
                .route(menu.getRoute())
                .metadata(Map.of(
                        "category", menu.getCategory(),
                        "keywords", menu.getKeywords(),
                        "icon", menu.getIcon() != null ? menu.getIcon() : ""
                ))
                .build();
    }

}
