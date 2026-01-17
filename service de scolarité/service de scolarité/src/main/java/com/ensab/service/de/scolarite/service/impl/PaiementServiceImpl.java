package com.ensab.service.de.scolarite.service.impl;

import com.ensab.service.de.scolarite.dto.paiement.PaiementRequestDTO;
import com.ensab.service.de.scolarite.dto.paiement.PaiementResponseDTO;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.entity.Paiement;
import com.ensab.service.de.scolarite.enums.StatusPaiement;
import com.ensab.service.de.scolarite.exception.ResourceNotFoundException;
import com.ensab.service.de.scolarite.mapper.PaiementMapper;
import com.ensab.service.de.scolarite.repository.EtudiantRepository;
import com.ensab.service.de.scolarite.repository.PaiementRepository;
import com.ensab.service.de.scolarite.service.PaiementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaiementServiceImpl implements PaiementService {

    private static final Logger logger = LoggerFactory.getLogger(PaiementServiceImpl.class);

    @Autowired
    PaiementRepository paiementRepository;

    @Autowired
    EtudiantRepository etudiantRepository;

    @Override
    public PaiementResponseDTO createPaiement(final PaiementRequestDTO paiementDTO) {

        final Etudiant etudiant = etudiantRepository.findByEmailAndCodeApogeeAndCin(
                paiementDTO.getEmail(),
                paiementDTO.getCodeApogee(),
                paiementDTO.getCin());

        if (etudiant == null) {
            throw new ResourceNotFoundException("Étudiant non trouvé avec les informations fournies.");
        }

        final Paiement paiement = PaiementMapper.toEntity(paiementDTO);
        paiement.setStatus(StatusPaiement.NON_PAYE);
        paiement.setDateCreation(new Date());
        paiement.setEtudiant(etudiant);

        final Paiement savedPaiement = paiementRepository.save(paiement);
        logger.info("Paiement created successfully with ID: {}", savedPaiement.getId());

        return PaiementMapper.toDTO(savedPaiement);
    }

    @Override
    public List<PaiementResponseDTO> getAllPaiements() {
        final List<Paiement> paiements = paiementRepository.findAll();
        return paiements.stream()
                .map(PaiementMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PaiementResponseDTO getPaiementById(Long id) {
        final Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouvé avec l'ID: " + id));
        return PaiementMapper.toDTO(paiement);
    }

    @Override
    public PaiementResponseDTO payPaiement(Long id) {
        final Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouvé avec l'ID: " + id));

        paiement.setStatus(StatusPaiement.PAYE);
        paiement.setDatePaiement(new Date());
        paiementRepository.save(paiement);
        logger.info("Paiement with ID: {} updated to PAYE.", id);

        return PaiementMapper.toDTO(paiement);
    }

    @Override
    public PaiementResponseDTO cancelPaiement(Long id) {
        final Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouvé avec l'ID: " + id));

        paiement.setStatus(StatusPaiement.NON_PAYE);
        paiementRepository.save(paiement);
        logger.info("Paiement with ID: {} updated to NON_PAYE.", id);

        return PaiementMapper.toDTO(paiement);
    }

    @Override
    public List<PaiementResponseDTO> getPaiementsByEtudiant(Long etudiantId) {
        List<Paiement> paiements = paiementRepository.findByEtudiantId(etudiantId);
        return paiements.stream()
                .map(PaiementMapper::toDTO)
                .collect(Collectors.toList());
    }
}