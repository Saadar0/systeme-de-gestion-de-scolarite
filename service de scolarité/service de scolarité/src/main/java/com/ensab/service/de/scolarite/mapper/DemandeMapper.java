package com.ensab.service.de.scolarite.mapper;

import com.ensab.service.de.scolarite.dto.demande.DemandeRequestDTO;
import com.ensab.service.de.scolarite.dto.demande.DemandeResponseDTO;
import com.ensab.service.de.scolarite.entity.Demande;

public class DemandeMapper {
    
    public static Demande toEntity(final DemandeRequestDTO demandeDTO) {
        if (demandeDTO == null) {
            return null;
        }

        final Demande demande = new Demande();
        demande.setTypeDocument(demandeDTO.getTypeDocument());
        
        return demande;
    }
    public static DemandeResponseDTO toDTO(final Demande demande) {
        if (demande == null) {
            return null;
        }

        final DemandeResponseDTO demandeDTO = new DemandeResponseDTO();
        demandeDTO.setId(demande.getId());
        demandeDTO.setTypeDocument(demande.getTypeDocument());
        demandeDTO.setStatus(demande.getStatus());
        demandeDTO.setDateCreation(demande.getDateCreation());
        demandeDTO.setDateTraitement(demande.getDateTraitement());
        demandeDTO.setEtudiant(EtudiantMapper.toBasicDTO(demande.getEtudiant()));
        demandeDTO.setAdmin(AdminMapper.toBasicDTO(demande.getAdmin()));
        demandeDTO.setAsyncErrorMessage(demande.getAsyncErrorMessage());
        
        return demandeDTO;
    }

}