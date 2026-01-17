package com.ensab.service.de.scolarite.service.impl;

import com.ensab.service.de.scolarite.dto.admin.AdminRequestDTO;
import com.ensab.service.de.scolarite.dto.admin.AdminResponseDTO;
import com.ensab.service.de.scolarite.entity.Admin;
import com.ensab.service.de.scolarite.enums.Role;
import com.ensab.service.de.scolarite.exception.ResourceNotFoundException;
import com.ensab.service.de.scolarite.mapper.AdminMapper;
import com.ensab.service.de.scolarite.repository.AdminRepository;
import com.ensab.service.de.scolarite.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public AdminResponseDTO createAdmin(AdminRequestDTO adminDTO) {
        Admin admin = AdminMapper.toEntity(adminDTO);
        admin.setRole(Role.ADMIN);
        Admin savedAdmin = adminRepository.save(admin);
        return AdminMapper.toDTO(savedAdmin);
    }

    @Override
    public List<AdminResponseDTO> getAllAdmins() {
        List<Admin> admins = adminRepository.findAll();
        return admins.stream()
                .map(AdminMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AdminResponseDTO getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + id));
        return AdminMapper.toDTO(admin);
    }

    @Override
    public AdminResponseDTO updateAdmin(Long id, AdminRequestDTO adminDTO) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + id));

        admin.setNom(adminDTO.getNom());
        admin.setPrenom(adminDTO.getPrenom());
        admin.setCin(adminDTO.getCin());
        admin.setNomUtilisateur(adminDTO.getNomUtilisateur());
        admin.setMotDePasse(adminDTO.getMotDePasse());

        Admin updatedAdmin = adminRepository.save(admin);
        return AdminMapper.toDTO(updatedAdmin);
    }

    @Override
    public void deleteAdmin(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + id));
        adminRepository.delete(admin);
    }
}