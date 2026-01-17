package com.ensab.service.de.scolarite.mapper;

import com.ensab.service.de.scolarite.dto.paiement.PaiementRequestDTO;
import com.ensab.service.de.scolarite.dto.paiement.PaiementResponseDTO;
import com.ensab.service.de.scolarite.entity.Paiement;

public class PaiementMapper {

    public static Paiement toEntity(final PaiementRequestDTO paiementDTO) {
        if (paiementDTO == null) {
            return null;
        }

        final Paiement paiement = new Paiement();
        paiement.setTypePaiement(paiementDTO.getTypePaiement());
        paiement.setMontant(paiementDTO.getMontant());

        return paiement;
    }

    public static PaiementResponseDTO toDTO(final Paiement paiement) {
        if (paiement == null) {
            return null;
        }

        final PaiementResponseDTO dto = new PaiementResponseDTO();
        dto.setId(paiement.getId());
        dto.setTypePaiement(paiement.getTypePaiement());
        dto.setStatus(paiement.getStatus());
        dto.setMontant(paiement.getMontant());
        dto.setDateCreation(paiement.getDateCreation());
        dto.setDatePaiement(paiement.getDatePaiement());
        dto.setEtudiant(EtudiantMapper.toBasicDTO(paiement.getEtudiant()));
        return dto;
    }
}