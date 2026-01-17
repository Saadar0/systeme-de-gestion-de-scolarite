package com.ensab.service.de.scolarite.service.impl;

import com.ensab.service.de.scolarite.dto.demande.DemandeRequestDTO;
import com.ensab.service.de.scolarite.dto.demande.DemandeResponseDTO;
import com.ensab.service.de.scolarite.entity.Admin;
import com.ensab.service.de.scolarite.entity.Demande;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.enums.StatusDemande;
import com.ensab.service.de.scolarite.exception.EntityDuplicateException;
import com.ensab.service.de.scolarite.exception.ResourceNotFoundException;
import com.ensab.service.de.scolarite.mapper.DemandeMapper;
import com.ensab.service.de.scolarite.repository.AdminRepository;
import com.ensab.service.de.scolarite.repository.DemandeRepository;
import com.ensab.service.de.scolarite.repository.EtudiantRepository;
import com.ensab.service.de.scolarite.service.DemandeService;
import com.ensab.service.de.scolarite.service.DocumentGenerationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandeServiceImpl implements DemandeService {

    private static final Logger logger = LoggerFactory.getLogger(DemandeServiceImpl.class);

    @Autowired
    DemandeRepository demandeRepository;

    @Autowired
    EtudiantRepository etudiantRepository;

    @Autowired
    AdminRepository adminRepository;

    @Autowired
    private DocumentGenerationService documentGenerationService;

    @Override
    public DemandeResponseDTO createDemande(final DemandeRequestDTO demandeDTO) {

        final Etudiant etudiant = etudiantRepository.findByEmailAndCodeApogeeAndCin(
                demandeDTO.getEmail(),
                demandeDTO.getCodeApogee(),
                demandeDTO.getCin());

        if (etudiant == null) {
            throw new ResourceNotFoundException("Étudiant non trouvé avec les informations fournies.");
        }

        // Vérification d'une demande en attente existante
        if (demandeRepository.existsByEtudiantAndStatusAndTypeDocument(etudiant, StatusDemande.EN_ATTENTE,
                demandeDTO.getTypeDocument())) {
            throw new EntityDuplicateException("Une demande en attente existe déjà pour cet étudiant.");
        }

        final Demande demande = DemandeMapper.toEntity(demandeDTO);
        demande.setStatus(StatusDemande.EN_ATTENTE);
        demande.setDateCreation(new Date());
        demande.setEtudiant(etudiant);

        final Demande savedDemande = demandeRepository.save(demande);
        logger.info("Demande created successfully with ID: {}", savedDemande.getId());

        return DemandeMapper.toDTO(savedDemande);
    }

    @Override
    public List<DemandeResponseDTO> getAllDemandes() {
        final List<Demande> demandes = demandeRepository.findAll();
        return demandes.stream()
                .map(DemandeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DemandeResponseDTO approveDemande(final Long id) {
        final Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande non trouvée avec l'ID: " + id));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Admin admin = adminRepository.findByNomUtilisateur(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with username: " + currentUsername));

        demande.setStatus(StatusDemande.APPROVEE);
        demande.setDateTraitement(new Date());
        demande.setAdmin(admin);
        demandeRepository.save(demande);
        logger.info("Demande with ID: {} updated to APPROVEE.", id);

        return DemandeMapper.toDTO(demande);
    }

    @Override
    public DemandeResponseDTO rejectDemande(final Long id) {
        final Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande non trouvée avec l'ID: " + id));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Admin admin = adminRepository.findByNomUtilisateur(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with username: " + currentUsername));

        demande.setStatus(StatusDemande.REFUSEE);
        demande.setDateTraitement(new Date());
        demande.setAdmin(admin);
        demandeRepository.save(demande);
        logger.info("Demande with ID: {} updated to REFUSEE.", id);

        return DemandeMapper.toDTO(demande);
    }

    @Override
    public DemandeResponseDTO getDemandeById(final Long id) {
        return demandeRepository.findById(id)
                .map(DemandeMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Demande non trouvée avec l'ID: " + id));
    }

    @Override
    public List<DemandeResponseDTO> getDemandesByEtudiant(Long etudiantId) {
        List<Demande> demandes = demandeRepository.findByEtudiantId(etudiantId);
        return demandes.stream()
                .map(DemandeMapper::toDTO)
                .collect(Collectors.toList());
    }
}