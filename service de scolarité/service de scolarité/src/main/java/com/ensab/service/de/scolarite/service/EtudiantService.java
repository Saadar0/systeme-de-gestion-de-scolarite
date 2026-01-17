package com.ensab.service.de.scolarite.service;

import com.ensab.service.de.scolarite.dto.etudiant.EtudiantRequestDTO;
import com.ensab.service.de.scolarite.dto.etudiant.EtudiantResponseDTO;

import java.util.List;

public interface EtudiantService {
    EtudiantResponseDTO createEtudiant(EtudiantRequestDTO etudiantDTO);
    List<EtudiantResponseDTO> getAllEtudiants();
    EtudiantResponseDTO getEtudiantById(Long id);
    EtudiantResponseDTO updateEtudiant(Long id, EtudiantRequestDTO etudiantDTO);
    void deleteEtudiant(Long id);
}