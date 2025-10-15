package com.petmily.backend.api.map.controller;

import com.petmily.backend.api.map.dto.LocationRequest;
import com.petmily.backend.api.map.dto.LocationResponse;
import com.petmily.backend.api.map.dto.MapConfigResponse;
import com.petmily.backend.api.map.service.MapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(origins = "*")
public class MapController {
    
    private final MapService mapService;
    
    public MapController(MapService mapService) {
        this.mapService = mapService;
    }
    
    @GetMapping("/config")
    public ResponseEntity<MapConfigResponse> getMapConfig() {
        MapConfigResponse config = mapService.getMapConfig();
        return ResponseEntity.ok(config);
    }
    
    @PostMapping("/location")
    public ResponseEntity<LocationResponse> updateUserLocation(@RequestBody LocationRequest request) {
        LocationResponse response = mapService.updateUserLocation(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/locations")
    public ResponseEntity<List<LocationResponse>> getActiveUserLocations() {
        List<LocationResponse> locations = mapService.getActiveUserLocations();
        return ResponseEntity.ok(locations);
    }
}

