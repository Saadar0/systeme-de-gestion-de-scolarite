package com.ensab.service.de.scolarite.dto.admin;

import com.ensab.service.de.scolarite.enums.Role;
import lombok.Data;

@Data
public class AdminResponseDTO {
    private Long id;
    private String nomUtilisateur;
    private Role role;
    private String nom;
    private String prenom;
    private String cin;
}