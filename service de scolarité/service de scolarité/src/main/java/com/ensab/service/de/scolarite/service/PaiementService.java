package com.ensab.service.de.scolarite.service;

import com.ensab.service.de.scolarite.dto.paiement.PaiementRequestDTO;
import com.ensab.service.de.scolarite.dto.paiement.PaiementResponseDTO;

import java.util.List;

public interface PaiementService {
    PaiementResponseDTO createPaiement(PaiementRequestDTO paiementDTO);

    List<PaiementResponseDTO> getAllPaiements();

    PaiementResponseDTO getPaiementById(Long id);

    PaiementResponseDTO payPaiement(Long id);

    PaiementResponseDTO cancelPaiement(Long id);

    List<PaiementResponseDTO> getPaiementsByEtudiant(Long etudiantId);
}