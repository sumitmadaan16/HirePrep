package com.project.placementservice.controller;

import com.project.placementservice.DTO.ApplicationResponseDTO;
import com.project.placementservice.DTO.PlacementRequestDTO;
import com.project.placementservice.DTO.PlacementResponseDTO;
import com.project.placementservice.service.PlacementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/placements")
//@CrossOrigin(origins = "*")
public class PlacementController {

    @Autowired
    private PlacementService service;

    @PostMapping
    public ResponseEntity<?> createPlacement(@RequestBody PlacementRequestDTO dto) {
        try {
            PlacementResponseDTO created = service.createPlacement(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<PlacementResponseDTO>> getAllPlacements(
            @RequestParam(required = false) String studentUsername) {
        return ResponseEntity.ok(service.getAllPlacements(studentUsername));
    }

    @GetMapping("/available")
    public ResponseEntity<List<PlacementResponseDTO>> getAvailablePlacements(
            @RequestParam String studentUsername) {
        return ResponseEntity.ok(service.getAvailablePlacements(studentUsername));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlacement(
            @PathVariable Long id,
            @RequestParam(required = false) String studentUsername) {
        try {
            return ResponseEntity.ok(service.getPlacementById(id, studentUsername));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyForPlacement(
            @PathVariable Long id,
            @RequestParam String studentUsername) {
        try {
            ApplicationResponseDTO application = service.applyForPlacement(id, studentUsername);
            return ResponseEntity.status(HttpStatus.CREATED).body(application);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/applications/student/{studentUsername}")
    public ResponseEntity<List<ApplicationResponseDTO>> getStudentApplications(
            @PathVariable String studentUsername) {
        return ResponseEntity.ok(service.getStudentApplications(studentUsername));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<List<ApplicationResponseDTO>> getPlacementApplications(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.getPlacementApplications(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlacement(
            @PathVariable Long id,
            @RequestBody PlacementRequestDTO dto) {
        try {
            PlacementResponseDTO updated = service.updatePlacement(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlacement(@PathVariable Long id) {
        service.deletePlacement(id);
        return ResponseEntity.noContent().build();
    }
}