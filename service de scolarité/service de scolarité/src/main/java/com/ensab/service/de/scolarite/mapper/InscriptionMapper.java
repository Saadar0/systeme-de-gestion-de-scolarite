package com.ensab.service.de.scolarite.mapper;

import com.ensab.service.de.scolarite.dto.inscription.InscriptionRequestDTO;
import com.ensab.service.de.scolarite.dto.inscription.InscriptionResponseDTO;
import com.ensab.service.de.scolarite.entity.Inscription;

public class InscriptionMapper {

    public static Inscription toEntity(final InscriptionRequestDTO inscriptionDTO) {
        if (inscriptionDTO == null) {
            return null;
        }

        final Inscription inscription = new Inscription();
        inscription.setTypeInscription(inscriptionDTO.getTypeInscription());
        inscription.setAnneeUniversitaire(inscriptionDTO.getAnneeUniversitaire());

        return inscription;
    }

    public static InscriptionResponseDTO toDTO(final Inscription inscription) {
        if (inscription == null) {
            return null;
        }

        final InscriptionResponseDTO dto = new InscriptionResponseDTO();
        dto.setId(inscription.getId());
        dto.setTypeInscription(inscription.getTypeInscription());
        dto.setStatus(inscription.getStatus());
        dto.setAnneeUniversitaire(inscription.getAnneeUniversitaire());
        dto.setDateCreation(inscription.getDateCreation());
        dto.setDateConfirmation(inscription.getDateConfirmation());
        dto.setEtudiant(EtudiantMapper.toBasicDTO(inscription.getEtudiant()));
        dto.setAdmin(AdminMapper.toBasicDTO(inscription.getAdmin()));
        return dto;
    }
}