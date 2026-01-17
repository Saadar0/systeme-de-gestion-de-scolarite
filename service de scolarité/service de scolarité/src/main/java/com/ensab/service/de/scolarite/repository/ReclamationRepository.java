package com.ensab.service.de.scolarite.repository;

import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.entity.Reclamation;
import com.ensab.service.de.scolarite.enums.StatusReclamation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {

    List<Reclamation> findByEtudiantId(Long etudiantId);

    @Query(value = "SELECT AVG(DATEDIFF(r.date_traitement, r.date_creation)) FROM reclamation r WHERE r.date_traitement IS NOT NULL", nativeQuery = true)
    Double calculateAverageReclamationsProcessingTime();

    @Query("SELECT (COUNT(r) * 100.0) / (SELECT COUNT(r2) FROM Reclamation r2) FROM Reclamation r WHERE r.status = 'TRAITEE'")
    Double calculateSatisfactionRate();

    // Reclamations per day of the current week
    @Query(value = """
            SELECT
                DAYNAME(r.date_creation) AS dayName,
                DAYOFWEEK(r.date_creation) AS dayOfWeek,
                COUNT(*)
            FROM reclamation r
            WHERE WEEK(r.date_creation, 1) = WEEK(CURDATE(), 1)
              AND YEAR(r.date_creation) = YEAR(CURDATE())
            GROUP BY dayName, dayOfWeek
            ORDER BY dayOfWeek
            """, nativeQuery = true)
    List<Object[]> countReclamationsPerDayOfWeek();

    Long countByStatus(StatusReclamation status);

    boolean existsByEtudiantAndStatus(Etudiant etudiant, StatusReclamation enAttente);
}