package com.petmily.backend.api.search.controller;

import com.petmily.backend.api.search.dto.MenuItem;
import com.petmily.backend.api.search.dto.SearchResponse;
import com.petmily.backend.api.search.dto.SearchResultItem;
import com.petmily.backend.api.search.service.MenuSearchService;
import com.petmily.backend.api.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;
    private final MenuSearchService menuSearchService;

    @GetMapping
    public ResponseEntity<SearchResponse> searchAll(
            @RequestParam String query,
            @RequestParam(required = false) List<String> types
    ) {
        return ResponseEntity.ok(searchService.searchAll(query, types));
    }

    @GetMapping("/{type}")
    public ResponseEntity<List<SearchResultItem>> searchByType(
            @PathVariable String type,
            @RequestParam String query
    ) {
        return ResponseEntity.ok(searchService.searchByType(type, query));
    }

    @GetMapping("/{type}/autocomplete")
    public ResponseEntity<List<String>> autocomplete(
            @PathVariable String type,
            @RequestParam String query
    ) {
        return ResponseEntity.ok(searchService.autocomplete(type, query));
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getAvailableTypes() {
        return ResponseEntity.ok(searchService.getAvailableTypes());
    }

    @GetMapping("/menu/category/{category}")
    public ResponseEntity<List<MenuItem>> getMenusByCategory(@PathVariable String category) {
        return ResponseEntity.ok(menuSearchService.getMenusByCategory(category));
    }
}


