package com.project.placementservice.DTO;

import com.project.placementservice.model.PlacementType;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PlacementResponseDTO {
    private Long id;
    private String title;
    private String role;
    private String experience;
    private String description;
    private PlacementType type;
    private LocalDate datePosted;
    private LocalDate dateOfDrive;
    private LocalDate lastDateToApply;
    private Double compensation;
    private String bond;
    private String postedByUsername;
    private Integer totalApplications;
    private Boolean hasApplied; // For student view
}