package com.ensab.service.de.scolarite.dto.note;

import lombok.Data;

@Data
public class NoteRequestDTO {
    private String module;
    private Double valeur;
    private Long etudiantId;
}