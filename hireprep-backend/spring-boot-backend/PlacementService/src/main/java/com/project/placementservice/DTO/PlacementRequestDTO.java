package com.project.placementservice.DTO;

import com.project.placementservice.model.PlacementType;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PlacementRequestDTO {
    private String title;
    private String role;
    private String experience;
    private String description;
    private PlacementType type;
    private LocalDate dateOfDrive;
    private LocalDate lastDateToApply;
    private Double compensation; // Stipend or Salary
    private String bond;
    private String postedByUsername; // Faculty username
}