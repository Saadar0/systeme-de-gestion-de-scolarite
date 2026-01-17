package com.ensab.service.de.scolarite.repository;

import com.ensab.service.de.scolarite.entity.Demande;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.enums.StatusDemande;
import com.ensab.service.de.scolarite.enums.TypeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandeRepository extends JpaRepository<Demande, Long> {

    List<Demande> findByEtudiantId(Long etudiantId);

    Long countByStatus(StatusDemande status);

    @Query(value = "SELECT AVG(DATEDIFF(d.date_traitement, d.date_creation)) FROM demande d WHERE d.date_traitement IS NOT NULL", nativeQuery = true)
    Double calculateAverageDemandesProcessingTime();

    // Monthly Attestations and Relevés de notes
    @Query("SELECT FUNCTION('MONTH', d.dateCreation), d.typeDocument, COUNT(d) FROM Demande d WHERE FUNCTION('YEAR', d.dateCreation) = FUNCTION('YEAR', CURRENT_DATE) GROUP BY FUNCTION('MONTH', d.dateCreation), d.typeDocument ORDER BY FUNCTION('MONTH', d.dateCreation)")
    List<Object[]> countDemandesPerMonthAndType();

    // Demandes per day of the current week
    @Query(value = """
            SELECT
                DAYNAME(d.date_creation) AS dayName,
                DAYOFWEEK(d.date_creation) AS dayOfWeek,
                COUNT(*)
            FROM demande d
            WHERE WEEK(d.date_creation, 1) = WEEK(CURDATE(), 1)
              AND YEAR(d.date_creation) = YEAR(CURDATE())
            GROUP BY dayName, dayOfWeek
            ORDER BY dayOfWeek
            """, nativeQuery = true)
    List<Object[]> countDemandesPerDayOfWeek();

    boolean existsByEtudiantAndStatusAndTypeDocument(Etudiant etudiant, StatusDemande enAttente, TypeDocument typeDocument);
}