package com.universidad.auditorio.repository;

import com.universidad.auditorio.model.Auditorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditorioRepository extends JpaRepository<Auditorio, Long> {
    Optional<Auditorio> findByNombre(String nombre);
    List<Auditorio> findByActivoTrue();
}





