package com.ensab.service.de.scolarite.controller;

import com.ensab.service.de.scolarite.dto.demande.DemandeRequestDTO;
import com.ensab.service.de.scolarite.dto.demande.DemandeResponseDTO;
import com.ensab.service.de.scolarite.dto.etudiant.EtudiantResponseDTO;
import com.ensab.service.de.scolarite.dto.inscription.InscriptionRequestDTO;
import com.ensab.service.de.scolarite.dto.inscription.InscriptionResponseDTO;
import com.ensab.service.de.scolarite.dto.note.NoteResponseDTO;
import com.ensab.service.de.scolarite.dto.paiement.PaiementRequestDTO;
import com.ensab.service.de.scolarite.dto.paiement.PaiementResponseDTO;
import com.ensab.service.de.scolarite.dto.reclamation.ReclamationRequestDTO;
import com.ensab.service.de.scolarite.dto.reclamation.ReclamationResponseDTO;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.mapper.EtudiantMapper;
import com.ensab.service.de.scolarite.repository.EtudiantRepository;
import com.ensab.service.de.scolarite.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etudiant")
@PreAuthorize("hasRole('ETUDIANT')")
@CrossOrigin
public class StudentController {

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private NoteService noteService;

    @Autowired
    private DemandeService demandeService;

    @Autowired
    private PaiementService paiementService;

    @Autowired
    private ReclamationService reclamationService;

    @Autowired
    private InscriptionService inscriptionService;

    private Etudiant getCurrentEtudiant() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return etudiantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Etudiant not found"));
    }

    @GetMapping("/profile")
    public EtudiantResponseDTO getProfile() {
        Etudiant etudiant = getCurrentEtudiant();
        return EtudiantMapper.toDTO(etudiant); // Assuming EtudiantMapper exists
    }

    @GetMapping("/notes")
    public List<NoteResponseDTO> getMyNotes() {
        Long etudiantId = getCurrentEtudiant().getId();
        return noteService.getNotesByEtudiant(etudiantId);
    }

    @GetMapping("/demandes")
    public List<DemandeResponseDTO> getMyDemandes() {
        Long etudiantId = getCurrentEtudiant().getId();
        return demandeService.getDemandesByEtudiant(etudiantId);
    }

    @GetMapping("/paiements")
    public List<PaiementResponseDTO> getMyPaiements() {
        Long etudiantId = getCurrentEtudiant().getId();
        return paiementService.getPaiementsByEtudiant(etudiantId);
    }

    @GetMapping("/reclamations")
    public List<ReclamationResponseDTO> getMyReclamations() {
        Long etudiantId = getCurrentEtudiant().getId();
        return reclamationService.getReclamationsByEtudiant(etudiantId);
    }

    @GetMapping("/inscriptions")
    public List<InscriptionResponseDTO> getMyInscriptions() {
        Long etudiantId = getCurrentEtudiant().getId();
        return inscriptionService.getInscriptionsByEtudiant(etudiantId);
    }

    @PostMapping("/inscriptions")
    public ResponseEntity<InscriptionResponseDTO> createInscription(@Validated @RequestBody InscriptionRequestDTO inscriptionDTO ) {
        // Get current student ID
        Long etudiantId = getCurrentEtudiant().getId();

        // Set the etudiantId from the authenticated user (security measure)
        inscriptionDTO.setEtudiantId(etudiantId);

        InscriptionResponseDTO inscriptionResponse = inscriptionService.createInscription(inscriptionDTO);
        return new ResponseEntity<>(inscriptionResponse, HttpStatus.CREATED);
    }
    @PostMapping("/demandes")
    public ResponseEntity<DemandeResponseDTO> createDemande(@Validated @RequestBody DemandeRequestDTO demandeDTO) {
        DemandeResponseDTO demandeResponse = demandeService.createDemande(demandeDTO);
        return new ResponseEntity<>(demandeResponse, HttpStatus.CREATED);
    }

    @PostMapping("/reclamations")
    public ResponseEntity<ReclamationResponseDTO> createReclamation(@Validated @RequestBody ReclamationRequestDTO reclamationDTO) {
        ReclamationResponseDTO reclamationResponse = reclamationService.createReclamation(reclamationDTO);
        return new ResponseEntity<>(reclamationResponse, HttpStatus.CREATED);
    }

    @PostMapping("/paiements")
    public ResponseEntity<PaiementResponseDTO> createPaiement(@Validated @RequestBody PaiementRequestDTO paiementDTO) {
        PaiementResponseDTO paiementResponse = paiementService.createPaiement(paiementDTO);
        return new ResponseEntity<>(paiementResponse, HttpStatus.CREATED);
    }
}