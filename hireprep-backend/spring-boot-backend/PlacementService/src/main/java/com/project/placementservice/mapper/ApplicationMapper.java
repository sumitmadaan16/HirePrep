package com.project.placementservice.mapper;

import com.project.placementservice.DTO.ApplicationResponseDTO;
import com.project.placementservice.DTO.PlacementResponseDTO;
import com.project.placementservice.model.Application;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    @Autowired
    private PlacementMapper placementMapper;

    public ApplicationResponseDTO toDTO(Application application) {
        ApplicationResponseDTO dto = new ApplicationResponseDTO();
        dto.setId(application.getId());
        dto.setPlacementId(application.getPlacement().getId());
        dto.setStudentUsername(application.getStudentUsername());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setStatus(application.getStatus());

        // Include placement details
        PlacementResponseDTO placementDTO = placementMapper.toDTO(
                application.getPlacement(), null, true
        );
        dto.setPlacement(placementDTO);

        return dto;
    }
}