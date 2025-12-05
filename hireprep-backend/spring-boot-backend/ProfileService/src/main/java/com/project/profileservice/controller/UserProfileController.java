package com.project.profileservice.controller;

import com.project.profileservice.DTO.AuthProfileDTO;
import com.project.profileservice.DTO.ProfileRequestDTO;
import com.project.profileservice.DTO.ProfileResponseDTO;
import com.project.profileservice.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
//@CrossOrigin(origins = "*")
public class UserProfileController {

    @Autowired
    private UserProfileService service;

    @PostMapping
    public ResponseEntity<?> createProfile(@RequestBody ProfileRequestDTO dto) {
        try {
            ProfileResponseDTO created = service.createProfile(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    @GetMapping("/{username}")
    public ResponseEntity<ProfileResponseDTO> getProfile(@PathVariable String username) {
        return service.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/auth/{username}")
    public ResponseEntity<AuthProfileDTO> getProfileForAuth(@PathVariable String username) {
        return service.findByUsernameForAuth(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/{username}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String username,
            @RequestBody ProfileRequestDTO dto) {
        try {
            ProfileResponseDTO updated = service.updateProfile(username, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("username", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    @DeleteMapping("/{username}")
    public ResponseEntity<Void> deleteProfile(@PathVariable String username) {
        service.deleteByUsername(username);
        return ResponseEntity.noContent().build();
    }
    @GetMapping
    public ResponseEntity<List<ProfileResponseDTO>> getAllProfiles() {
        return ResponseEntity.ok(service.findAll());
    }
    @GetMapping("/faculty/{username}/mentees")
    public ResponseEntity<?> getMentees(@PathVariable String username) {
        try {
            List<ProfileResponseDTO> mentees = service.getMenteesByFacultyUsername(username);
            return ResponseEntity.ok(mentees);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    @GetMapping("/faculty")
    public ResponseEntity<List<ProfileResponseDTO>> getAllFaculty() {
        return ResponseEntity.ok(service.getAllFaculty());
    }
}