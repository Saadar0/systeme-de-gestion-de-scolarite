package com.ensab.service.de.scolarite.dto.note;

import lombok.Data;

@Data
public class NoteResponseDTO {
    private Long id;
    private String module;
    private Double valeur;
    private Long etudiantId;
}