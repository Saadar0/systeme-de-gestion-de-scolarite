package com.ensab.service.de.scolarite.service;

import com.ensab.service.de.scolarite.dto.demande.DemandeRequestDTO;
import com.ensab.service.de.scolarite.dto.demande.DemandeResponseDTO;

import java.util.List;

public interface DemandeService {
    DemandeResponseDTO createDemande(DemandeRequestDTO demandeDTO);

    List<DemandeResponseDTO> getAllDemandes();

    DemandeResponseDTO getDemandeById(Long id);

    DemandeResponseDTO approveDemande(Long id);

    DemandeResponseDTO rejectDemande(Long id);

    List<DemandeResponseDTO> getDemandesByEtudiant(Long etudiantId);

}
