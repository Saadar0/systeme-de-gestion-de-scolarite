package com.ensab.service.de.scolarite.service;

import com.ensab.service.de.scolarite.dto.note.NoteRequestDTO;
import com.ensab.service.de.scolarite.dto.note.NoteResponseDTO;

import java.util.List;

public interface NoteService {
    NoteResponseDTO addNote(NoteRequestDTO noteDTO);
    List<NoteResponseDTO> getNotesByEtudiant(Long etudiantId);
    NoteResponseDTO updateNote(Long id, NoteRequestDTO noteDTO);
    void deleteNote(Long id);
}