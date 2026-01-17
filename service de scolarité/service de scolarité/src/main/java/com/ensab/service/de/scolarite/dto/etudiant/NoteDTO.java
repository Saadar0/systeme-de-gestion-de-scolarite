package com.ensab.service.de.scolarite.dto.etudiant;

import lombok.Data;

@Data
public class NoteDTO {
    private Long id;
    private String module;
    private Double valeur;
}