package com.ensab.service.de.scolarite.service.impl;

import com.ensab.service.de.scolarite.dto.reclamation.ReclamationRequestDTO;
import com.ensab.service.de.scolarite.dto.reclamation.ReclamationResponseDTO;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.entity.Reclamation;
import com.ensab.service.de.scolarite.enums.StatusReclamation;
import com.ensab.service.de.scolarite.exception.ResourceNotFoundException;
import com.ensab.service.de.scolarite.mapper.ReclamationMapper;
import com.ensab.service.de.scolarite.repository.EtudiantRepository;
import com.ensab.service.de.scolarite.repository.ReclamationRepository;
import com.ensab.service.de.scolarite.service.ReclamationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReclamationServiceImpl implements ReclamationService {

    private static final Logger logger = LoggerFactory.getLogger(DemandeServiceImpl.class);

    @Autowired
    private ReclamationRepository reclamationRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Override
    public ReclamationResponseDTO createReclamation(final ReclamationRequestDTO reclamationDTO) {

        // Recherche de l'étudiant
        final Etudiant etudiant = etudiantRepository.findByEmailAndCodeApogeeAndCin(
                reclamationDTO.getEmail(),
                reclamationDTO.getCodeApogee(),
                reclamationDTO.getCin());

        if (etudiant == null) {
            throw new ResourceNotFoundException("Étudiant non trouvé avec les informations fournies.");
        }

        
        // Création de la réclamation
        final Reclamation reclamation = ReclamationMapper.toEntity(reclamationDTO);
        reclamation.setStatus(StatusReclamation.EN_ATTENTE);
        reclamation.setDateCreation(new Date());
        reclamation.setEtudiant(etudiant);

        final Reclamation savedReclamation = reclamationRepository.save(reclamation);
        logger.info("Reclamation created successfully with ID: {}", savedReclamation.getId());

        return ReclamationMapper.toDTO(savedReclamation);
    }

    @Override
    public List<ReclamationResponseDTO> getAllReclamations() {
        final List<Reclamation> reclamations = reclamationRepository.findAll();
        return reclamations.stream()
                .map(ReclamationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ReclamationResponseDTO treatReclamation(final Long id, final ReclamationRequestDTO reclamationDTO) {

        // Recherche de la réclamation
        final Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réclamation non trouvée avec l'id " + id));

        // Traitement de la réclamation
        reclamation.setReponse(reclamationDTO.getReponse());
        reclamation.setDateTraitement(new Date());

        reclamation.setStatus(StatusReclamation.TRAITEE);
        reclamationRepository.save(reclamation);

        logger.info("Reclamation with ID: {} processed successfully.", id);

        return ReclamationMapper.toDTO(reclamation);

    }

    @Override
    public ReclamationResponseDTO getReclamationById(Long id) {
        return reclamationRepository.findById(id)
                .map(ReclamationMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Réclamation non trouvée avec l'id " + id));
    }

    @Override
    public List<ReclamationResponseDTO> getReclamationsByEtudiant(Long etudiantId) {
        List<Reclamation> reclamations = reclamationRepository.findByEtudiantId(etudiantId);
        return reclamations.stream()
                .map(ReclamationMapper::toDTO)
                .collect(Collectors.toList());
    }
}