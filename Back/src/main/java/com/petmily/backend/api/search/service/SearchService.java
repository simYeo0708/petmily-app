package com.petmily.backend.api.search.service;

import com.petmily.backend.api.search.dto.SearchResponse;
import com.petmily.backend.api.search.dto.SearchResultItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SearchService {

    private final Map<String, SearchStrategy> strategies;

    public SearchService(List<SearchStrategy> strategyList) {
        this.strategies = strategyList.stream()
                .filter(SearchStrategy::isEnabled)
                .collect(Collectors.toMap(
                        SearchStrategy::getSearchType,
                        strategy -> strategy
                ));
        log.info("Registered search strategies: {}", strategies.keySet());
    }

    public SearchResponse searchAll(String query, List<String> filterTypes) {
        Map<String, List<SearchResultItem>> resultsByType = new HashMap<>();
        Set<String> allSuggestions = new HashSet<>();
        int totalCount = 0;

        Collection<SearchStrategy> strategiesToSearch = filterTypes != null && !filterTypes.isEmpty()
                ? filterTypes.stream()
                .map(strategies::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList())
                : strategies.values();

        for(SearchStrategy strategy : strategiesToSearch) {
            try {
                List<SearchResultItem> results = strategy.search(query);
                if(!results.isEmpty()) {
                    resultsByType.put(strategy.getSearchType(), results);
                    totalCount += results.size();
                }

                List<String> suggestions = strategy.autocomplete(query);
                allSuggestions.addAll(suggestions);
            } catch (Exception e) {
                log.error("Search failed for type: {}", strategy.getSearchType(), e);
            }
        }

        return SearchResponse.builder()
                .query(query)
                .results(resultsByType)
                .suggestions(new ArrayList<>(allSuggestions).stream().limit(10).collect(Collectors.toList()))
                .totalCount(totalCount)
                .build();
    }

    public List<SearchResultItem> searchByType(String type, String query) {
        SearchStrategy strategy = strategies.get(type);
        if(strategy == null) {
            log.warn("Unknown search type: {}", type);
            return List.of();
        }
        return strategy.search(query);
    }

    public List<String> autocomplete(String type, String query) {
        SearchStrategy strategy = strategies.get(type);
        if(strategy == null) {
            return List.of();
        }
        return strategy.autocomplete(query);
    }

    public List<String> getAvailableTypes() {
        return new ArrayList<>(strategies.keySet());
    }

}
