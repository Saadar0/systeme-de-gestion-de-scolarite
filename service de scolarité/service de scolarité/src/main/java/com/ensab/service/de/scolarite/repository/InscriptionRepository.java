package com.ensab.service.de.scolarite.repository;

import com.ensab.service.de.scolarite.entity.Inscription;
import com.ensab.service.de.scolarite.enums.StatusInscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    List<Inscription> findByEtudiantId(Long etudiantId);

    Long countByStatus(StatusInscription status);

    @Query(value = "SELECT AVG(DATEDIFF(i.date_confirmation, i.date_creation)) FROM inscription i WHERE i.date_confirmation IS NOT NULL", nativeQuery = true)
    Double calculateAverageInscriptionsProcessingTime();

    // Monthly Inscriptions
    @Query("SELECT FUNCTION('MONTH', i.dateCreation), i.typeInscription, COUNT(i) FROM Inscription i WHERE FUNCTION('YEAR', i.dateCreation) = FUNCTION('YEAR', CURRENT_DATE) GROUP BY FUNCTION('MONTH', i.dateCreation), i.typeInscription ORDER BY FUNCTION('MONTH', i.dateCreation)")
    List<Object[]> countInscriptionsPerMonthAndType();
}