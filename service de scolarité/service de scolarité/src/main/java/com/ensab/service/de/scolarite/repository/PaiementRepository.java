package com.ensab.service.de.scolarite.repository;

import com.ensab.service.de.scolarite.entity.Paiement;
import com.ensab.service.de.scolarite.enums.StatusPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {

    List<Paiement> findByEtudiantId(Long etudiantId);

    Long countByStatus(StatusPaiement status);

    @Query(value = "SELECT AVG(DATEDIFF(p.date_paiement, p.date_creation)) FROM paiement p WHERE p.date_paiement IS NOT NULL", nativeQuery = true)
    Double calculateAveragePaiementsProcessingTime();

    // Monthly Paiements
    @Query("SELECT FUNCTION('MONTH', p.dateCreation), p.typePaiement, COUNT(p) FROM Paiement p WHERE FUNCTION('YEAR', p.dateCreation) = FUNCTION('YEAR', CURRENT_DATE) GROUP BY FUNCTION('MONTH', p.dateCreation), p.typePaiement ORDER BY FUNCTION('MONTH', p.dateCreation)")
    List<Object[]> countPaiementsPerMonthAndType();
}