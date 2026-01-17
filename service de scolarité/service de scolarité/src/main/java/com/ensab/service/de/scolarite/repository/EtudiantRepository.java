package com.ensab.service.de.scolarite.repository;

import com.ensab.service.de.scolarite.entity.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Etudiant findByEmailAndCodeApogeeAndCin(String email, Integer codeApogee, String cin);

    Optional<Etudiant> findByEmail(String email);

    @Query("SELECT e FROM Etudiant e LEFT JOIN FETCH e.notes WHERE e.id = :id")
    Optional<Etudiant> findByIdWithNotes(@Param("id") Long id);
}
