package com.project.placementservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"placement_id", "student_username"}))
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "placement_id", nullable = false)
    private Placement placement;

    @Column(nullable = false)
    private String studentUsername;

    @Column(nullable = false)
    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
    }
}