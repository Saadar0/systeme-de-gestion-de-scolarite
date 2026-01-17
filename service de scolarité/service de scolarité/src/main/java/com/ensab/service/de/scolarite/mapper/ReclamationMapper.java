package com.ensab.service.de.scolarite.mapper;

import com.ensab.service.de.scolarite.dto.reclamation.ReclamationRequestDTO;
import com.ensab.service.de.scolarite.dto.reclamation.ReclamationResponseDTO;
import com.ensab.service.de.scolarite.entity.Reclamation;

public class ReclamationMapper {

    public static Reclamation toEntity(final ReclamationRequestDTO reclamationDTO) {
        if (reclamationDTO == null) {
            return null;
        }

        final Reclamation reclamation = new Reclamation();
        reclamation.setSujet(reclamationDTO.getSujet());
        reclamation.setMessage(reclamationDTO.getMessage());
        reclamation.setReponse(reclamationDTO.getReponse());
        return reclamation;
    }

    public static ReclamationResponseDTO toDTO(final Reclamation reclamation) {
        if (reclamation == null) {
            return null;
        }

        final ReclamationResponseDTO dto = new ReclamationResponseDTO();
        dto.setId(reclamation.getId());
        dto.setSujet(reclamation.getSujet());
        dto.setMessage(reclamation.getMessage());
        dto.setStatus(reclamation.getStatus());
        dto.setDateCreation(reclamation.getDateCreation());
        dto.setDateTraitement(reclamation.getDateTraitement());
        dto.setReponse(reclamation.getReponse());
        dto.setEtudiant(EtudiantMapper.toBasicDTO(reclamation.getEtudiant()));
        return dto;
    }
}