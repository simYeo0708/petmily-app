package com.petmily.backend.api.map.controller;

import com.petmily.backend.api.map.dto.*;
import com.petmily.backend.api.map.service.MapService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/map")
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
    public ResponseEntity<LocationResponse> updateUserLocation(
            @RequestBody LocationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        LocationResponse response = mapService.updateUserLocation(request, userDetails);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/locations")
    public ResponseEntity<List<LocationResponse>> getActiveUserLocations() {
        List<LocationResponse> locations = mapService.getActiveUserLocations();
        return ResponseEntity.ok(locations);
    }

    @PostMapping("/sessions")
    public ResponseEntity<WalkSessionResponse> createWalkSession(
            @RequestBody WalkSessionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        WalkSessionResponse response = mapService.createWalkSession(request, userDetails);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/{walkSessionId}/end")
    public ResponseEntity<WalkSessionResponse> endWalkSession(
            @PathVariable Long walkSessionId,
            @RequestBody EndWalkSessionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        WalkSessionResponse response = mapService.endWalkSession(
                walkSessionId,
                request.getEndLatitude(),
                request.getEndLongitude(),
                request.getTotalDistance(),
                request.getDurationSeconds(),
                userDetails
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/routes/{walkSessionId}")
    public ResponseEntity<RouteResponse> getWalkRoute(
            @PathVariable Long walkSessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        RouteResponse response = mapService.getWalkRoute(walkSessionId, userDetails);
        return ResponseEntity.ok(response);
    }
}

