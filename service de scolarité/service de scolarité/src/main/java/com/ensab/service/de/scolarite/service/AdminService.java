package com.ensab.service.de.scolarite.service;

import com.ensab.service.de.scolarite.dto.admin.AdminRequestDTO;
import com.ensab.service.de.scolarite.dto.admin.AdminResponseDTO;

import java.util.List;

public interface AdminService {
    AdminResponseDTO createAdmin(AdminRequestDTO adminDTO);
    List<AdminResponseDTO> getAllAdmins();
    AdminResponseDTO getAdminById(Long id);
    AdminResponseDTO updateAdmin(Long id, AdminRequestDTO adminDTO);
    void deleteAdmin(Long id);
}