package com.project.placementservice.repository;

import com.project.placementservice.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentUsername(String studentUsername);
    List<Application> findByPlacementId(Long placementId);
    Optional<Application> findByPlacementIdAndStudentUsername(Long placementId, String studentUsername);
    boolean existsByPlacementIdAndStudentUsername(Long placementId, String studentUsername);
    int countByPlacementId(Long placementId);
}