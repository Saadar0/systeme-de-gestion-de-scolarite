package com.ensab.service.de.scolarite.dto.etudiant;

import lombok.Data;

@Data
public class EtudiantBasicDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String codeApogee; // String au lieu de int
    private String cin;
    private String filiere;
}