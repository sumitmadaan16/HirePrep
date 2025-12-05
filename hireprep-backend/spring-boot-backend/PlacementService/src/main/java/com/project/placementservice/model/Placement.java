package com.project.placementservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Placement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String experience;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlacementType type;

    @Column(nullable = false)
    private LocalDate datePosted;

    @Column(nullable = false)
    private LocalDate dateOfDrive;

    @Column(nullable = false)
    private LocalDate lastDateToApply;

    @Column(nullable = false)
    private Double compensation;

    private String bond;

    @Column(nullable = false)
    private String postedByUsername;

    @OneToMany(mappedBy = "placement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        datePosted = LocalDate.now();
    }
}