package com.project.placementservice.service;

import com.project.placementservice.DTO.ApplicationResponseDTO;
import com.project.placementservice.DTO.PlacementRequestDTO;
import com.project.placementservice.DTO.PlacementResponseDTO;
import com.project.placementservice.mapper.ApplicationMapper;
import com.project.placementservice.mapper.PlacementMapper;
import com.project.placementservice.model.Application;
import com.project.placementservice.model.Placement;
import com.project.placementservice.repository.ApplicationRepository;
import com.project.placementservice.repository.PlacementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlacementService {

    @Autowired
    private PlacementRepository placementRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private PlacementMapper placementMapper;

    @Autowired
    private ApplicationMapper applicationMapper;

    @Transactional
    public PlacementResponseDTO createPlacement(PlacementRequestDTO dto) {
        Placement placement = placementMapper.toEntity(dto);
        Placement saved = placementRepository.save(placement);
        return placementMapper.toDTO(saved, 0, false);
    }

    public List<PlacementResponseDTO> getAllPlacements(String studentUsername) {
        List<Placement> placements = placementRepository.findAllByOrderByDatePostedDesc();
        return placements.stream()
                .map(p -> {
                    int totalApps = applicationRepository.countByPlacementId(p.getId());
                    boolean hasApplied = studentUsername != null &&
                            applicationRepository.existsByPlacementIdAndStudentUsername(p.getId(), studentUsername);
                    return placementMapper.toDTO(p, totalApps, hasApplied);
                })
                .collect(Collectors.toList());
    }

    public List<PlacementResponseDTO> getAvailablePlacements(String studentUsername) {
        List<Placement> placements = placementRepository
                .findByLastDateToApplyGreaterThanEqualOrderByDatePostedDesc(LocalDate.now());

        return placements.stream()
                .filter(p -> !applicationRepository.existsByPlacementIdAndStudentUsername(p.getId(), studentUsername))
                .map(p -> {
                    int totalApps = applicationRepository.countByPlacementId(p.getId());
                    return placementMapper.toDTO(p, totalApps, false);
                })
                .collect(Collectors.toList());
    }

    public PlacementResponseDTO getPlacementById(Long id, String studentUsername) {
        Placement placement = placementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Placement not found"));

        int totalApps = applicationRepository.countByPlacementId(id);
        boolean hasApplied = studentUsername != null &&
                applicationRepository.existsByPlacementIdAndStudentUsername(id, studentUsername);

        return placementMapper.toDTO(placement, totalApps, hasApplied);
    }

    @Transactional
    public ApplicationResponseDTO applyForPlacement(Long placementId, String studentUsername) {
        Placement placement = placementRepository.findById(placementId)
                .orElseThrow(() -> new RuntimeException("Placement not found"));

        if (LocalDate.now().isAfter(placement.getLastDateToApply())) {
            throw new RuntimeException("Application deadline has passed");
        }

        if (applicationRepository.existsByPlacementIdAndStudentUsername(placementId, studentUsername)) {
            throw new RuntimeException("Already applied for this placement");
        }

        Application application = new Application();
        application.setPlacement(placement);
        application.setStudentUsername(studentUsername);

        Application saved = applicationRepository.save(application);
        return applicationMapper.toDTO(saved);
    }

    public List<ApplicationResponseDTO> getStudentApplications(String studentUsername) {
        List<Application> applications = applicationRepository.findByStudentUsername(studentUsername);
        return applications.stream()
                .map(applicationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponseDTO> getPlacementApplications(Long placementId) {
        List<Application> applications = applicationRepository.findByPlacementId(placementId);
        return applications.stream()
                .map(applicationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePlacement(Long id) {
        placementRepository.deleteById(id);
    }

    @Transactional
    public PlacementResponseDTO updatePlacement(Long id, PlacementRequestDTO dto) {
        Placement existing = placementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Placement not found"));

        existing.setTitle(dto.getTitle());
        existing.setRole(dto.getRole());
        existing.setExperience(dto.getExperience());
        existing.setDescription(dto.getDescription());
        existing.setType(dto.getType());
        existing.setDateOfDrive(dto.getDateOfDrive());
        existing.setLastDateToApply(dto.getLastDateToApply());
        existing.setCompensation(dto.getCompensation());
        existing.setBond(dto.getBond());

        Placement updated = placementRepository.save(existing);
        int totalApps = applicationRepository.countByPlacementId(id);
        return placementMapper.toDTO(updated, totalApps, false);
    }
}