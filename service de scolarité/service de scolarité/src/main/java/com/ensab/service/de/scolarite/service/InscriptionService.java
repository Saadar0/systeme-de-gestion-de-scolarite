package com.ensab.service.de.scolarite.service;

import com.ensab.service.de.scolarite.dto.inscription.InscriptionRequestDTO;
import com.ensab.service.de.scolarite.dto.inscription.InscriptionResponseDTO;

import java.util.List;

public interface InscriptionService {
    InscriptionResponseDTO createInscription(InscriptionRequestDTO inscriptionDTO);

    List<InscriptionResponseDTO> getAllInscriptions();

    InscriptionResponseDTO getInscriptionById(Long id);

    InscriptionResponseDTO confirmInscription(Long id);

    InscriptionResponseDTO cancelInscription(Long id);

    List<InscriptionResponseDTO> getInscriptionsByEtudiant(Long etudiantId);
}