package com.ensab.service.de.scolarite.mapper;

import com.ensab.service.de.scolarite.dto.note.NoteRequestDTO;
import com.ensab.service.de.scolarite.dto.note.NoteResponseDTO;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.entity.Note;

public class NoteMapper {

    public static Note toEntity(NoteRequestDTO dto, Etudiant etudiant) {
        Note note = new Note();
        note.setModule(dto.getModule());
        note.setValeur(dto.getValeur());
        note.setEtudiant(etudiant);
        return note;
    }

    public static NoteResponseDTO toDTO(Note note) {
        NoteResponseDTO dto = new NoteResponseDTO();
        dto.setId(note.getId());
        dto.setModule(note.getModule());
        dto.setValeur(note.getValeur());
        dto.setEtudiantId(note.getEtudiant().getId());
        return dto;
    }
}