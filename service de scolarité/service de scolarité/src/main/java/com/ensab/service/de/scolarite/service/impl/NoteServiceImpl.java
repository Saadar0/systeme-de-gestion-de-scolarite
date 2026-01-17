package com.ensab.service.de.scolarite.service.impl;

import com.ensab.service.de.scolarite.dto.note.NoteRequestDTO;
import com.ensab.service.de.scolarite.dto.note.NoteResponseDTO;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.entity.Note;
import com.ensab.service.de.scolarite.exception.ResourceNotFoundException;
import com.ensab.service.de.scolarite.mapper.NoteMapper;
import com.ensab.service.de.scolarite.repository.EtudiantRepository;
import com.ensab.service.de.scolarite.repository.NoteRepository;
import com.ensab.service.de.scolarite.service.NoteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteServiceImpl implements NoteService {

    private static final Logger logger = LoggerFactory.getLogger(NoteServiceImpl.class);

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Override
    public NoteResponseDTO addNote(NoteRequestDTO noteDTO) {
        Etudiant etudiant = etudiantRepository.findById(noteDTO.getEtudiantId())
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant not found with ID: " + noteDTO.getEtudiantId()));
        Note note = NoteMapper.toEntity(noteDTO, etudiant);
        Note savedNote = noteRepository.save(note);
        logger.info("Note added for etudiant ID: {}", noteDTO.getEtudiantId());
        return NoteMapper.toDTO(savedNote);
    }

    @Override
    public List<NoteResponseDTO> getNotesByEtudiant(Long etudiantId) {
        List<Note> notes = noteRepository.findByEtudiantId(etudiantId);
        return notes.stream()
                .map(NoteMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NoteResponseDTO updateNote(Long id, NoteRequestDTO noteDTO) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with ID: " + id));
        note.setModule(noteDTO.getModule());
        note.setValeur(noteDTO.getValeur());
        Note updatedNote = noteRepository.save(note);
        logger.info("Note updated with ID: {}", id);
        return NoteMapper.toDTO(updatedNote);
    }

    @Override
    public void deleteNote(Long id) {
        if (!noteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Note not found with ID: " + id);
        }
        noteRepository.deleteById(id);
        logger.info("Note deleted with ID: {}", id);
    }
}