package com.project.profileservice.DTO;

import com.project.profileservice.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthProfileDTO {
    private String username;
    private String password;
    private String email;
    private Role role;
    private String firstName;
    private String lastName;
}