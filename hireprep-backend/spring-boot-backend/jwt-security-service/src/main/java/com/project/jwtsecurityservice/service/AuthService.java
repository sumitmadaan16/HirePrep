package com.project.jwtsecurityservice.service;

import com.project.jwtsecurityservice.dto.LoginRequest;
import com.project.jwtsecurityservice.dto.LoginResponse;
import com.project.jwtsecurityservice.dto.RegisterRequest;
import com.project.jwtsecurityservice.utill.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PROFILE_SERVICE_URL = "http://localhost:8081/api/profile";

    public LoginResponse register(RegisterRequest request) {
        System.out.println("Registration attempt for username: " + request.getUsername());
        try {
            try {
                ResponseEntity<ProfileDTO> existingProfile = restTemplate.getForEntity(
                        PROFILE_SERVICE_URL + "/auth/" + request.getUsername(),
                        ProfileDTO.class
                );
                System.out.println("Username already exists: " + request.getUsername());
                throw new RuntimeException("Username already exists");
            } catch (HttpClientErrorException.NotFound e) {
                System.out.println("Username available, proceeding with registration");
            }

            Map<String, Object> profileData = new HashMap<>();
            profileData.put("username", request.getUsername());
            profileData.put("password", request.getPassword());
            profileData.put("email", request.getEmail());
            profileData.put("firstName", request.getFirstName());
            profileData.put("lastName", request.getLastName());
            profileData.put("phoneNumber", request.getPhoneNumber());
            profileData.put("gender", request.getGender());
            profileData.put("role", request.getRole() != null ? request.getRole() : "STUDENT");

            System.out.println("Sending profile creation request to: " + PROFILE_SERVICE_URL);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(profileData, headers);

            ResponseEntity<ProfileDTO> response = restTemplate.postForEntity(
                    PROFILE_SERVICE_URL,
                    entity,
                    ProfileDTO.class
            );

            System.out.println("Profile created successfully");

            ProfileDTO profile = response.getBody();
            if (profile == null) {
                System.out.println("ERROR: Profile response is null");
                throw new RuntimeException("Failed to create profile");
            }

            System.out.println("Profile data: username=" + profile.getUsername() + ", role=" + profile.getRole());

            String roleStr = profile.getRole() != null ? profile.getRole().toString() : "STUDENT";
            String token = jwtUtil.generateToken(profile.getUsername(), roleStr);

            System.out.println("Registration successful for: " + profile.getUsername());

            return new LoginResponse(
                    token,
                    profile.getUsername(),
                    roleStr,
                    profile.getFirstName(),
                    profile.getLastName()
            );
        } catch (HttpServerErrorException e) {
            System.err.println("Profile service error: " + e.getResponseBodyAsString());
            String errorBody = e.getResponseBodyAsString();
            if (errorBody.contains("user_profile_email_key") || (errorBody.contains("email") && errorBody.contains("already exists"))) {
                throw new RuntimeException("Email already exists");
            } else if (errorBody.contains("user_profile_username_key") || (errorBody.contains("username") && errorBody.contains("already exists"))) {
                throw new RuntimeException("Username already exists");
            } else {
                throw new RuntimeException("Registration failed: Unable to create profile");
            }
        } catch (HttpClientErrorException e) {
            System.err.println("Profile service client error: " + e.getResponseBodyAsString());
            String errorBody = e.getResponseBodyAsString();
            if (errorBody.contains("Email already exists")) {
                throw new RuntimeException("Email already exists");
            } else if (errorBody.contains("Username already exists")) {
                throw new RuntimeException("Username already exists");
            } else {
                throw new RuntimeException("Registration failed: " + errorBody);
            }
        } catch (RestClientException e) {
            System.err.println("REST client error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Registration failed: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Registration failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public LoginResponse login(LoginRequest request) {
        System.out.println("=== LOGIN ATTEMPT START ===");
        System.out.println("Username: " + request.getUsername());

        // Use the /auth/ endpoint that includes password
        String profileServiceUrl = PROFILE_SERVICE_URL + "/auth/" + request.getUsername();

        try {
            System.out.println("Fetching profile from: " + profileServiceUrl);

            ResponseEntity<ProfileDTO> response = restTemplate.getForEntity(
                    profileServiceUrl,
                    ProfileDTO.class
            );

            System.out.println("Profile fetch response status: " + response.getStatusCode());

            ProfileDTO profile = response.getBody();

            if (profile == null) {
                System.err.println("ERROR: Profile response body is null");
                throw new RuntimeException("User not found");
            }

            System.out.println("Profile retrieved: username=" + profile.getUsername() + ", role=" + profile.getRole());
            System.out.println("Password hash retrieved: " + (profile.getPassword() != null ? "YES" : "NO"));

            boolean passwordMatches = passwordEncoder.matches(request.getPassword(), profile.getPassword());
            System.out.println("Password match result: " + passwordMatches);

            if (!passwordMatches) {
                System.err.println("ERROR: Password does not match");
                throw new RuntimeException("Invalid credentials");
            }

            String roleStr = profile.getRole() != null ? profile.getRole().toString() : "STUDENT";
            System.out.println("Generating JWT token with role: " + roleStr);

            String token = jwtUtil.generateToken(profile.getUsername(), roleStr);
            System.out.println("JWT token generated successfully");

            LoginResponse loginResponse = new LoginResponse(
                    token,
                    profile.getUsername(),
                    roleStr,
                    profile.getFirstName(),
                    profile.getLastName()
            );

            System.out.println("=== LOGIN SUCCESSFUL ===");

            return loginResponse;

        } catch (HttpClientErrorException.NotFound e) {
            System.err.println("ERROR: User not found - 404");
            throw new RuntimeException("User not found");
        } catch (RuntimeException e) {
            System.err.println("ERROR: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("ERROR: Authentication failed - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    public boolean validateToken(String token) {
        return jwtUtil.isTokenValid(token);
    }

    @lombok.Data
    private static class ProfileDTO {
        private String username;
        private String password;
        private String email;
        private Object role;
        private String firstName;
        private String lastName;

        public String getRole() {
            if (role == null) return "STUDENT";
            return role.toString();
        }
    }
}