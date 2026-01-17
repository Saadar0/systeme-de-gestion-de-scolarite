package com.ensab.service.de.scolarite.mapper;

import com.ensab.service.de.scolarite.dto.admin.AdminBasicDTO;
import com.ensab.service.de.scolarite.dto.admin.AdminRequestDTO;
import com.ensab.service.de.scolarite.dto.admin.AdminResponseDTO;
import com.ensab.service.de.scolarite.entity.Admin;

public class AdminMapper {

    public static Admin toEntity(final AdminRequestDTO adminDTO) {
        if (adminDTO == null) {
            return null;
        }

        final Admin admin = new Admin();
        admin.setNomUtilisateur(adminDTO.getNomUtilisateur());
        admin.setMotDePasse(adminDTO.getMotDePasse());
        admin.setNom(adminDTO.getNom());
        admin.setPrenom(adminDTO.getPrenom());
        admin.setCin(adminDTO.getCin());

        return admin;
    }

    public static AdminResponseDTO toDTO(final Admin admin) {
        if (admin == null) {
            return null;
        }

        final AdminResponseDTO dto = new AdminResponseDTO();
        dto.setId(admin.getId());
        dto.setNomUtilisateur(admin.getNomUtilisateur());
        dto.setRole(admin.getRole());
        dto.setNom(admin.getNom());
        dto.setPrenom(admin.getPrenom());
        dto.setCin(admin.getCin());

        return dto;
    }

    public static AdminBasicDTO toBasicDTO(final Admin admin) {
        if (admin == null) {
            return null;
        }

        final AdminBasicDTO dto = new AdminBasicDTO();
        dto.setId(admin.getId());
        dto.setNom(admin.getNom());
        dto.setPrenom(admin.getPrenom());

        return dto;
    }
}