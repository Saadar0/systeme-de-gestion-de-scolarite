package com.ensab.service.de.scolarite.service.impl;

import com.ensab.service.de.scolarite.dto.inscription.InscriptionRequestDTO;
import com.ensab.service.de.scolarite.dto.inscription.InscriptionResponseDTO;
import com.ensab.service.de.scolarite.entity.Admin;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.entity.Inscription;
import com.ensab.service.de.scolarite.enums.StatusInscription;
import com.ensab.service.de.scolarite.exception.ResourceNotFoundException;
import com.ensab.service.de.scolarite.mapper.InscriptionMapper;
import com.ensab.service.de.scolarite.repository.AdminRepository;
import com.ensab.service.de.scolarite.repository.EtudiantRepository;
import com.ensab.service.de.scolarite.repository.InscriptionRepository;
import com.ensab.service.de.scolarite.service.InscriptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InscriptionServiceImpl implements InscriptionService {

    private static final Logger logger = LoggerFactory.getLogger(InscriptionServiceImpl.class);

    @Autowired
    InscriptionRepository inscriptionRepository;

    @Autowired
    EtudiantRepository etudiantRepository;

    @Autowired
    AdminRepository adminRepository;

    @Override
    public InscriptionResponseDTO createInscription(final InscriptionRequestDTO inscriptionDTO) {

        // Changed: Find student by ID instead of email/codeApogee/cin
        final Etudiant etudiant = etudiantRepository.findById(inscriptionDTO.getEtudiantId())
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant non trouvé avec l'ID: " + inscriptionDTO.getEtudiantId()));

        final Inscription inscription = InscriptionMapper.toEntity(inscriptionDTO);
        inscription.setStatus(StatusInscription.ENREGISTRE);
        inscription.setDateCreation(new Date());
        inscription.setEtudiant(etudiant);

        final Inscription savedInscription = inscriptionRepository.save(inscription);
        logger.info("Inscription created successfully with ID: {}", savedInscription.getId());

        return InscriptionMapper.toDTO(savedInscription);
    }

    @Override
    public List<InscriptionResponseDTO> getAllInscriptions() {
        final List<Inscription> inscriptions = inscriptionRepository.findAll();
        return inscriptions.stream()
                .map(InscriptionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InscriptionResponseDTO getInscriptionById(Long id) {
        final Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription non trouvée avec l'ID: " + id));
        return InscriptionMapper.toDTO(inscription);
    }

    @Override
    public InscriptionResponseDTO confirmInscription(Long id) {
        final Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription non trouvée avec l'ID: " + id));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Admin admin = adminRepository.findByNomUtilisateur(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with username: " + currentUsername));

        inscription.setStatus(StatusInscription.CONFIRME);
        inscription.setDateConfirmation(new Date());
        inscription.setAdmin(admin);
        inscriptionRepository.save(inscription);
        logger.info("Inscription with ID: {} updated to CONFIRME.", id);

        return InscriptionMapper.toDTO(inscription);
    }

    @Override
    public InscriptionResponseDTO cancelInscription(Long id) {
        final Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription non trouvée avec l'ID: " + id));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Admin admin = adminRepository.findByNomUtilisateur(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with username: " + currentUsername));

        inscription.setStatus(StatusInscription.ANNULE);
        inscription.setAdmin(admin);
        inscriptionRepository.save(inscription);
        logger.info("Inscription with ID: {} updated to ANNULE.", id);

        return InscriptionMapper.toDTO(inscription);
    }

    @Override
    public List<InscriptionResponseDTO> getInscriptionsByEtudiant(Long etudiantId) {
        List<Inscription> inscriptions = inscriptionRepository.findByEtudiantId(etudiantId);
        return inscriptions.stream()
                .map(InscriptionMapper::toDTO)
                .collect(Collectors.toList());
    }
}