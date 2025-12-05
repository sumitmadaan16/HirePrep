package com.project.attendanceservice.controller;

import com.project.attendanceservice.DTO.AttendanceRequestDTO;
import com.project.attendanceservice.DTO.AttendanceResponseDTO;
import com.project.attendanceservice.DTO.AttendanceStatsDTO;
import com.project.attendanceservice.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
//@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService service;

    // Mark attendance for students
    @PostMapping("/mark")
    public ResponseEntity<?> markAttendance(@RequestBody AttendanceRequestDTO request) {
        try {
            List<AttendanceResponseDTO> responses = service.markAttendance(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(responses);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get attendance for a specific student
    @GetMapping("/student/{username}")
    public ResponseEntity<?> getStudentAttendance(@PathVariable String username) {
        try {
            List<AttendanceResponseDTO> attendance = service.getStudentAttendance(username);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Get attendance statistics for a student
    @GetMapping("/student/{username}/stats")
    public ResponseEntity<?> getStudentStats(@PathVariable String username) {
        try {
            AttendanceStatsDTO stats = service.getStudentStats(username);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Get all attendance records marked by a faculty
    @GetMapping("/faculty/{username}")
    public ResponseEntity<?> getFacultyAttendanceRecords(@PathVariable String username) {
        try {
            List<AttendanceResponseDTO> records = service.getFacultyAttendanceRecords(username);
            return ResponseEntity.ok(records);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Get attendance by subject
    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(service.getAttendanceBySubject(subject));
    }

    // Delete attendance record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        service.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    // Get list of all subjects
    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getAllSubjects() {
        return ResponseEntity.ok(service.getAllSubjects());
    }
}