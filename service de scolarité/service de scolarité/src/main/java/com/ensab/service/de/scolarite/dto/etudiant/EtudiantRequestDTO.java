package com.ensab.service.de.scolarite.dto.etudiant;

import lombok.Data;

import java.util.Date;

@Data
public class EtudiantRequestDTO {
    private String nom;
    private String prenom;
    private String email;
    private int codeApogee;
    private String cin;
    private String filiere;
    private String niveau;
    private String anneeUniversitaire;
}