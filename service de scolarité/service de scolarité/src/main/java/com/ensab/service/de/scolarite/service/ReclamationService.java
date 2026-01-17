package com.ensab.service.de.scolarite.service;

import com.ensab.service.de.scolarite.dto.reclamation.ReclamationRequestDTO;
import com.ensab.service.de.scolarite.dto.reclamation.ReclamationResponseDTO;

import java.util.List;

public interface ReclamationService {
    ReclamationResponseDTO createReclamation(ReclamationRequestDTO reclamationDTO);

    List<ReclamationResponseDTO> getAllReclamations();

    ReclamationResponseDTO treatReclamation(Long id, ReclamationRequestDTO reclamationDTO);

    ReclamationResponseDTO getReclamationById(Long id);

    List<ReclamationResponseDTO> getReclamationsByEtudiant(Long etudiantId);
}