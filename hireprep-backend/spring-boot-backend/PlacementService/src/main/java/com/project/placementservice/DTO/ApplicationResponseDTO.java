package com.project.placementservice.DTO;

import com.project.placementservice.model.ApplicationStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ApplicationResponseDTO {
    private Long id;
    private Long placementId;
    private String studentUsername;
    private LocalDateTime appliedAt;
    private ApplicationStatus status;
    private PlacementResponseDTO placement;
}