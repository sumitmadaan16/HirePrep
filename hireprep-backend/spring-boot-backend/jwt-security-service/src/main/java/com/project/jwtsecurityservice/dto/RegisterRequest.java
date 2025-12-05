package com.project.jwtsecurityservice.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String gender;
    private String role; // STUDENT or FACULTY
}