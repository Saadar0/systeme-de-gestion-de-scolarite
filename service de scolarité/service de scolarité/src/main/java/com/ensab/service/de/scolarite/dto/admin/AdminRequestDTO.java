package com.ensab.service.de.scolarite.dto.admin;

import lombok.Data;

@Data
public class AdminRequestDTO {
    private String nomUtilisateur;
    private String motDePasse;
    private String nom;
    private String prenom;
    private String cin;
}