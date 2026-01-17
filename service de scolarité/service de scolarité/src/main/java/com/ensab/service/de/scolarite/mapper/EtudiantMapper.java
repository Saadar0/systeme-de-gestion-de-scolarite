package com.ensab.service.de.scolarite.mapper;

import com.ensab.service.de.scolarite.dto.etudiant.*;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.entity.Note;

import java.util.stream.Collectors;

public class EtudiantMapper {

    public static EtudiantBasicDTO toBasicDTO(Etudiant etudiant) {
        EtudiantBasicDTO dto = new EtudiantBasicDTO();
        dto.setId(etudiant.getId());
        dto.setNom(etudiant.getNom());
        dto.setPrenom(etudiant.getPrenom());
        dto.setEmail(etudiant.getEmail());
        dto.setCodeApogee(String.valueOf(etudiant.getCodeApogee())); // int → String
        dto.setCin(etudiant.getCin());
        dto.setFiliere(etudiant.getFiliere());
        return dto;
    }

    public static EtudiantDetailedDTO toDetailedDTO(Etudiant etudiant) {
        EtudiantDetailedDTO dto = new EtudiantDetailedDTO();
        dto.setId(etudiant.getId());
        dto.setNom(etudiant.getNom());
        dto.setPrenom(etudiant.getPrenom()); // Add prenom
        dto.setEmail(etudiant.getEmail());
        dto.setCodeApogee(etudiant.getCodeApogee());
        dto.setCin(etudiant.getCin());
        dto.setFiliere(etudiant.getFiliere());
        dto.setNiveau(etudiant.getNiveau());
        dto.setAnneeUniversitaire(etudiant.getAnneeUniversitaire());
        dto.setNotes(etudiant.getNotes().stream().map(EtudiantMapper::toNoteDTO).collect(Collectors.toList()));
        return dto;
    }

    public static EtudiantResponseDTO toDTO(Etudiant etudiant) {
        EtudiantResponseDTO dto = new EtudiantResponseDTO();
        dto.setId(etudiant.getId());
        dto.setNom(etudiant.getNom());
        dto.setPrenom(etudiant.getPrenom()); // Add prenom
        dto.setEmail(etudiant.getEmail());
        dto.setCodeApogee(etudiant.getCodeApogee());
        dto.setCin(etudiant.getCin());
        dto.setFiliere(etudiant.getFiliere());
        dto.setNiveau(etudiant.getNiveau());
        dto.setAnneeUniversitaire(etudiant.getAnneeUniversitaire());
        dto.setNotes(etudiant.getNotes().stream().map(EtudiantMapper::toNoteDTO).collect(Collectors.toList()));
        return dto;
    }

    public static Etudiant toEntity(EtudiantRequestDTO dto) {
        Etudiant etudiant = new Etudiant();
        etudiant.setNom(dto.getNom());
        etudiant.setPrenom(dto.getPrenom()); // Add prenom
        etudiant.setEmail(dto.getEmail());
        etudiant.setCodeApogee(dto.getCodeApogee());
        etudiant.setCin(dto.getCin());
        etudiant.setFiliere(dto.getFiliere());
        etudiant.setNiveau(dto.getNiveau());
        etudiant.setAnneeUniversitaire(dto.getAnneeUniversitaire());
        return etudiant;
    }

    public static NoteDTO toNoteDTO(Note note) {
        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setModule(note.getModule());
        dto.setValeur(note.getValeur());
        return dto;
    }
}