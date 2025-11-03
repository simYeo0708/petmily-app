package com.petmily.backend.api.search.controller;

import com.petmily.backend.api.search.dto.MenuItem;
import com.petmily.backend.api.search.dto.SearchResponse;
import com.petmily.backend.api.search.dto.SearchResultItem;
import com.petmily.backend.api.search.service.MenuSearchService;
import com.petmily.backend.api.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;
    private final MenuSearchService menuSearchService;

    @GetMapping
    public ResponseEntity<SearchResponse> searchAll(
            @RequestParam String query,
            @RequestParam(required = false) List<String> types) {
        SearchResponse response = searchService.searchAll(query, types);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{type}")
    public ResponseEntity<List<SearchResultItem>> searchByType(
            @PathVariable String type,
            @RequestParam String query) {
        List<SearchResultItem> results = searchService.searchByType(type, query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{type}/autocomplete")
    public ResponseEntity<List<String>> autocomplete(
            @PathVariable String type,
            @RequestParam String query) {
        List<String> suggestions = searchService.autocomplete(type, query);
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getAvailableTypes() {
        List<String> types = searchService.getAvailableTypes();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/menu/category/{category}")
    public ResponseEntity<List<MenuItem>> getMenusByCategory(@PathVariable String category) {
        List<MenuItem> menus = menuSearchService.getMenusByCategory(category);
        return ResponseEntity.ok(menus);
    }

}