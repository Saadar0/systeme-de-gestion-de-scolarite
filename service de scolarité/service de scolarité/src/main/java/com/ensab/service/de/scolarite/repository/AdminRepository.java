package com.ensab.service.de.scolarite.repository;

import com.ensab.service.de.scolarite.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByNomUtilisateur(String nomUtilisateur);
}