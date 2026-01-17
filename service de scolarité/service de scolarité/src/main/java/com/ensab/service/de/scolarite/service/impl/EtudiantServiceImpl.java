package com.ensab.service.de.scolarite.service.impl;

import com.ensab.service.de.scolarite.dto.etudiant.EtudiantRequestDTO;
import com.ensab.service.de.scolarite.dto.etudiant.EtudiantResponseDTO;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.entity.Utilisateur;
import com.ensab.service.de.scolarite.enums.Role;
import com.ensab.service.de.scolarite.exception.ResourceNotFoundException;
import com.ensab.service.de.scolarite.mapper.EtudiantMapper;
import com.ensab.service.de.scolarite.repository.EtudiantRepository;
import com.ensab.service.de.scolarite.repository.UserRepository;
import com.ensab.service.de.scolarite.service.EtudiantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EtudiantServiceImpl implements EtudiantService {

    private static final Logger logger = LoggerFactory.getLogger(EtudiantServiceImpl.class);

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public EtudiantResponseDTO createEtudiant(EtudiantRequestDTO etudiantDTO) {
        Etudiant etudiant = EtudiantMapper.toEntity(etudiantDTO);

        // Définir les propriétés héritées de Utilisateur
        etudiant.setNomUtilisateur(etudiantDTO.getEmail());
        etudiant.setMotDePasse(passwordEncoder.encode("password")); // Default password
        etudiant.setRole(Role.ETUDIANT);

        // Sauvegarder (cela créera automatiquement l'entrée dans utilisateur ET etudiant)
        Etudiant savedEtudiant = etudiantRepository.save(etudiant);

        logger.info("Etudiant created with ID: {}", savedEtudiant.getId());
        return EtudiantMapper.toDTO(savedEtudiant);
    }

    @Override
    public List<EtudiantResponseDTO> getAllEtudiants() {
        List<Etudiant> etudiants = etudiantRepository.findAll();
        return etudiants.stream()
                .map(EtudiantMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EtudiantResponseDTO getEtudiantById(Long id) {
        Etudiant etudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant not found with ID: " + id));
        return EtudiantMapper.toDTO(etudiant);
    }

    @Override
    public EtudiantResponseDTO updateEtudiant(Long id, EtudiantRequestDTO etudiantDTO) {
        Etudiant etudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant not found with ID: " + id));
        etudiant.setNom(etudiantDTO.getNom());
        etudiant.setEmail(etudiantDTO.getEmail());
        etudiant.setCodeApogee(etudiantDTO.getCodeApogee());
        etudiant.setCin(etudiantDTO.getCin());
        etudiant.setFiliere(etudiantDTO.getFiliere());
        etudiant.setNiveau(etudiantDTO.getNiveau());
        etudiant.setAnneeUniversitaire(etudiantDTO.getAnneeUniversitaire());
        Etudiant updatedEtudiant = etudiantRepository.save(etudiant);
        logger.info("Etudiant updated with ID: {}", id);
        return EtudiantMapper.toDTO(updatedEtudiant);
    }

    @Override
    public void deleteEtudiant(Long id) {
        if (!etudiantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Etudiant not found with ID: " + id);
        }
        etudiantRepository.deleteById(id);
        logger.info("Etudiant deleted with ID: {}", id);
    }
}