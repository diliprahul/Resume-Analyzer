package com.resume.analyzer.repository;

import com.resume.analyzer.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {
    @Query("SELECT j FROM Job j LEFT JOIN FETCH j.skills WHERE j.active = true ORDER BY j.postDate DESC")
    List<Job> findByActiveTrueOrderByPostDateDesc();

    @Query("SELECT j FROM Job j LEFT JOIN FETCH j.skills WHERE j.id = :id")
    Optional<Job> findByIdWithSkills(@Param("id") Long id);
}
