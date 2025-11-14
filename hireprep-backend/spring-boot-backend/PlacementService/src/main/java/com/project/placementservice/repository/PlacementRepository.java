package com.project.placementservice.repository;

import com.project.placementservice.model.Placement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface PlacementRepository extends JpaRepository<Placement, Long> {
    List<Placement> findByPostedByUsername(String username);
    List<Placement> findByLastDateToApplyGreaterThanEqualOrderByDatePostedDesc(LocalDate date);
    List<Placement> findAllByOrderByDatePostedDesc();
}