package com.ensab.service.de.scolarite.controller;

import com.ensab.service.de.scolarite.dto.admin.AdminRequestDTO;
import com.ensab.service.de.scolarite.dto.admin.AdminResponseDTO;
import com.ensab.service.de.scolarite.dto.demande.DemandeRequestDTO;
import com.ensab.service.de.scolarite.dto.demande.DemandeResponseDTO;
import com.ensab.service.de.scolarite.dto.etudiant.EtudiantRequestDTO;
import com.ensab.service.de.scolarite.dto.etudiant.EtudiantResponseDTO;
import com.ensab.service.de.scolarite.dto.inscription.InscriptionRequestDTO;
import com.ensab.service.de.scolarite.dto.inscription.InscriptionResponseDTO;
import com.ensab.service.de.scolarite.dto.note.NoteRequestDTO;
import com.ensab.service.de.scolarite.dto.note.NoteResponseDTO;
import com.ensab.service.de.scolarite.dto.paiement.PaiementRequestDTO;
import com.ensab.service.de.scolarite.dto.paiement.PaiementResponseDTO;
import com.ensab.service.de.scolarite.dto.reclamation.ReclamationRequestDTO;
import com.ensab.service.de.scolarite.dto.reclamation.ReclamationResponseDTO;
import com.ensab.service.de.scolarite.enums.TypeDocument;
import com.ensab.service.de.scolarite.service.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final DemandeService demandeService;
    private final ReclamationService reclamationService;
    private final PaiementService paiementService;
    private final InscriptionService inscriptionService;
    private final AdminService adminService;
    private final DocumentGenerationService documentGenerationService;
    private final EtudiantService etudiantService;
    private final NoteService noteService;

    public AdminController(DemandeService demandeService, ReclamationService reclamationService, PaiementService paiementService, InscriptionService inscriptionService, AdminService adminService, DocumentGenerationService documentGenerationService, EtudiantService etudiantService, NoteService noteService) {
        this.demandeService = demandeService;
        this.reclamationService = reclamationService;
        this.paiementService = paiementService;
        this.inscriptionService = inscriptionService;
        this.adminService = adminService;
        this.documentGenerationService = documentGenerationService;
        this.etudiantService = etudiantService;
        this.noteService = noteService;
    }
    @GetMapping("/demandes")
    public ResponseEntity<List<DemandeResponseDTO>> getAllDemandes() {
        return ResponseEntity.ok(demandeService.getAllDemandes());
    }

    @GetMapping("/demandes/{id}")
    public ResponseEntity<DemandeResponseDTO> getDemandeById(@PathVariable Long id) {
        return ResponseEntity.ok(demandeService.getDemandeById(id));
    }

    @PostMapping("/demandes")
    public ResponseEntity<DemandeResponseDTO> createDemande(@Validated @RequestBody DemandeRequestDTO demandeDTO) {
        DemandeResponseDTO demandeResponse = demandeService.createDemande(demandeDTO);
        return new ResponseEntity<>(demandeResponse, HttpStatus.CREATED);
    }

    @PutMapping("/demandes/{id}/approve")
    public ResponseEntity<DemandeResponseDTO> approveDemande(@PathVariable Long id) {
        DemandeResponseDTO approvedDemande = demandeService.approveDemande(id);
        return ResponseEntity.ok(approvedDemande);
    }

    @PutMapping("/demandes/{id}/reject")
    public ResponseEntity<DemandeResponseDTO> rejectDemande(@PathVariable Long id) {
        DemandeResponseDTO rejectedDemande = demandeService.rejectDemande(id);
        return ResponseEntity.ok(rejectedDemande);
    }

    @GetMapping("/etudiants")
    public ResponseEntity<List<EtudiantResponseDTO>> getAllEtudiants() {
        return ResponseEntity.ok(etudiantService.getAllEtudiants());
    }

    @GetMapping("/etudiants/{id}")
    public ResponseEntity<EtudiantResponseDTO> getEtudiantById(@PathVariable Long id) {
        return ResponseEntity.ok(etudiantService.getEtudiantById(id));
    }

    @PostMapping("/etudiants")
    public ResponseEntity<EtudiantResponseDTO> createEtudiant(@Validated @RequestBody EtudiantRequestDTO etudiantDTO) {
        EtudiantResponseDTO etudiantResponse = etudiantService.createEtudiant(etudiantDTO);
        return new ResponseEntity<>(etudiantResponse, HttpStatus.CREATED);
    }

    @PutMapping("/etudiants/{id}")
    public ResponseEntity<EtudiantResponseDTO> updateEtudiant(@PathVariable Long id, @Validated @RequestBody EtudiantRequestDTO etudiantDTO) {
        EtudiantResponseDTO updatedEtudiant = etudiantService.updateEtudiant(id, etudiantDTO);
        return ResponseEntity.ok(updatedEtudiant);
    }

    @DeleteMapping("/etudiants/{id}")
    public ResponseEntity<Void> deleteEtudiant(@PathVariable Long id) {
        etudiantService.deleteEtudiant(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/notes")
    public ResponseEntity<NoteResponseDTO> addNote(@Validated @RequestBody NoteRequestDTO noteDTO) {
        NoteResponseDTO noteResponse = noteService.addNote(noteDTO);
        return new ResponseEntity<>(noteResponse, HttpStatus.CREATED);
    }

    @GetMapping("/etudiants/{etudiantId}/notes")
    public ResponseEntity<List<NoteResponseDTO>> getNotesByEtudiant(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(noteService.getNotesByEtudiant(etudiantId));
    }

    @PutMapping("/notes/{id}")
    public ResponseEntity<NoteResponseDTO> updateNote(@PathVariable Long id, @Validated @RequestBody NoteRequestDTO noteDTO) {
        NoteResponseDTO updatedNote = noteService.updateNote(id, noteDTO);
        return ResponseEntity.ok(updatedNote);
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reclamations")
    public ResponseEntity<List<ReclamationResponseDTO>> getAllReclamations() {
        return ResponseEntity.ok(reclamationService.getAllReclamations());
    }

    @GetMapping("/reclamations/{id}")
    public ResponseEntity<ReclamationResponseDTO> getReclamationById(@PathVariable Long id) {
        return ResponseEntity.ok(reclamationService.getReclamationById(id));
    }

    @PostMapping("/reclamations")
    public ResponseEntity<ReclamationResponseDTO> createReclamation(
            @Validated @RequestBody ReclamationRequestDTO reclamationDTO) {
        ReclamationResponseDTO reclamationResponse = reclamationService.createReclamation(reclamationDTO);
        return new ResponseEntity<>(reclamationResponse, HttpStatus.CREATED);
    }

    @PutMapping("/reclamations/{id}/treat")
    public ResponseEntity<ReclamationResponseDTO> treatReclamation(
            @PathVariable Long id,
            @Validated @RequestBody ReclamationRequestDTO reclamationDTO) {
        ReclamationResponseDTO treatedReclamation = reclamationService.treatReclamation(id, reclamationDTO);
        return ResponseEntity.ok(treatedReclamation);
    }

    @GetMapping("/paiements")
    public ResponseEntity<List<PaiementResponseDTO>> getAllPaiements() {
        return ResponseEntity.ok(paiementService.getAllPaiements());
    }

    @GetMapping("/paiements/{id}")
    public ResponseEntity<PaiementResponseDTO> getPaiementById(@PathVariable Long id) {
        return ResponseEntity.ok(paiementService.getPaiementById(id));
    }

    @PostMapping("/paiements")
    public ResponseEntity<PaiementResponseDTO> createPaiement(@Validated @RequestBody PaiementRequestDTO paiementDTO) {
        PaiementResponseDTO paiementResponse = paiementService.createPaiement(paiementDTO);
        return new ResponseEntity<>(paiementResponse, HttpStatus.CREATED);
    }

    @PutMapping("/paiements/{id}/pay")
    public ResponseEntity<PaiementResponseDTO> payPaiement(@PathVariable Long id) {
        PaiementResponseDTO paidPaiement = paiementService.payPaiement(id);
        return ResponseEntity.ok(paidPaiement);
    }

    @PutMapping("/paiements/{id}/cancel")
    public ResponseEntity<PaiementResponseDTO> cancelPaiement(@PathVariable Long id) {
        PaiementResponseDTO cancelledPaiement = paiementService.cancelPaiement(id);
        return ResponseEntity.ok(cancelledPaiement);
    }

    @GetMapping("/inscriptions")
    public ResponseEntity<List<InscriptionResponseDTO>> getAllInscriptions() {
        return ResponseEntity.ok(inscriptionService.getAllInscriptions());
    }

    @GetMapping("/inscriptions/{id}")
    public ResponseEntity<InscriptionResponseDTO> getInscriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(inscriptionService.getInscriptionById(id));
    }

    @PostMapping("/inscriptions")
    public ResponseEntity<InscriptionResponseDTO> createInscription(@Validated @RequestBody InscriptionRequestDTO inscriptionDTO) {
        InscriptionResponseDTO inscriptionResponse = inscriptionService.createInscription(inscriptionDTO);
        return new ResponseEntity<>(inscriptionResponse, HttpStatus.CREATED);
    }

    @PutMapping("/inscriptions/{id}/confirm")
    public ResponseEntity<InscriptionResponseDTO> confirmInscription(@PathVariable Long id) {
        InscriptionResponseDTO confirmedInscription = inscriptionService.confirmInscription(id);
        return ResponseEntity.ok(confirmedInscription);
    }

    @PutMapping("/inscriptions/{id}/cancel")
    public ResponseEntity<InscriptionResponseDTO> cancelInscription(@PathVariable Long id) {
        InscriptionResponseDTO cancelledInscription = inscriptionService.cancelInscription(id);
        return ResponseEntity.ok(cancelledInscription);
    }

    @GetMapping("/demandes/{id}/pdf")
    public ResponseEntity<byte[]> getDemandePdf(@PathVariable Long id) throws ExecutionException, InterruptedException {
        DemandeResponseDTO demande = demandeService.getDemandeById(id);
        byte[] pdfBytes = documentGenerationService
                .generateDocument(demande.getTypeDocument(), demande.getEtudiant().getId()).get();
        return ResponseEntity.ok()
                .headers(createPdfHeaders(demande))
                .body(pdfBytes);
    }

    @GetMapping("/admins")
    public ResponseEntity<List<AdminResponseDTO>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    @GetMapping("/admins/{id}")
    public ResponseEntity<AdminResponseDTO> getAdminById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getAdminById(id));
    }

    @PostMapping("/admins")
    public ResponseEntity<AdminResponseDTO> createAdmin(@Validated @RequestBody AdminRequestDTO adminDTO) {
        AdminResponseDTO adminResponse = adminService.createAdmin(adminDTO);
        return new ResponseEntity<>(adminResponse, HttpStatus.CREATED);
    }

    @PutMapping("/admins/{id}")
    public ResponseEntity<AdminResponseDTO> updateAdmin(@PathVariable Long id, @Validated @RequestBody AdminRequestDTO adminDTO) {
        AdminResponseDTO updatedAdmin = adminService.updateAdmin(id, adminDTO);
        return ResponseEntity.ok(updatedAdmin);
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }

    // Private helper methods
    private HttpHeaders createPdfHeaders(DemandeResponseDTO demande) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = demande.getTypeDocument() == TypeDocument.ATTESTATION_SCOLARITE
                ? "Attestation_Scolarite_" + demande.getEtudiant().getNom() + ".pdf"
                : "Releve_de_Notes_" + demande.getEtudiant().getNom() + ".pdf";
        headers.setContentDispositionFormData("attachment", filename);
        return headers;
    }
}