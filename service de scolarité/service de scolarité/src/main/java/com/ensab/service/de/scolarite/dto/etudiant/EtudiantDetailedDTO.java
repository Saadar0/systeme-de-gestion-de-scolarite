package com.ensab.service.de.scolarite.dto.etudiant;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class EtudiantDetailedDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private int codeApogee;
    private String cin;
    private String filiere;
    private String niveau;
    private String anneeUniversitaire;
    private List<NoteDTO> notes;
}