package com.project.placementservice.mapper;

import com.project.placementservice.DTO.PlacementRequestDTO;
import com.project.placementservice.DTO.PlacementResponseDTO;
import com.project.placementservice.model.Placement;
import org.springframework.stereotype.Component;

@Component
public class PlacementMapper {

    public Placement toEntity(PlacementRequestDTO dto) {
        Placement placement = new Placement();
        placement.setTitle(dto.getTitle());
        placement.setRole(dto.getRole());
        placement.setExperience(dto.getExperience());
        placement.setDescription(dto.getDescription());
        placement.setType(dto.getType());
        placement.setDateOfDrive(dto.getDateOfDrive());
        placement.setLastDateToApply(dto.getLastDateToApply());
        placement.setCompensation(dto.getCompensation());
        placement.setBond(dto.getBond());
        placement.setPostedByUsername(dto.getPostedByUsername());
        return placement;
    }

    public PlacementResponseDTO toDTO(Placement placement, Integer totalApplications, Boolean hasApplied) {
        PlacementResponseDTO dto = new PlacementResponseDTO();
        dto.setId(placement.getId());
        dto.setTitle(placement.getTitle());
        dto.setRole(placement.getRole());
        dto.setExperience(placement.getExperience());
        dto.setDescription(placement.getDescription());
        dto.setType(placement.getType());
        dto.setDatePosted(placement.getDatePosted());
        dto.setDateOfDrive(placement.getDateOfDrive());
        dto.setLastDateToApply(placement.getLastDateToApply());
        dto.setCompensation(placement.getCompensation());
        dto.setBond(placement.getBond());
        dto.setPostedByUsername(placement.getPostedByUsername());
        dto.setTotalApplications(totalApplications);
        dto.setHasApplied(hasApplied);
        return dto;
    }
}