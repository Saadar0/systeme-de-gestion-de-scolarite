package com.ensab.service.de.scolarite;

import com.ensab.service.de.scolarite.entity.Admin;
import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.entity.Utilisateur;
import com.ensab.service.de.scolarite.enums.Role;
import com.ensab.service.de.scolarite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnableAsync
@SpringBootApplication
public class ServiceDeScolariteApplication implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public static void main(String[] args) {
        SpringApplication.run(ServiceDeScolariteApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.findByNomUtilisateur("admin").isPresent()) {
            // Create Admin instance instead of Utilisateur
            Admin admin = new Admin();

            admin.setNomUtilisateur("admin");
            admin.setMotDePasse(passwordEncoder.encode("admin"));
            admin.setRole(Role.ADMIN);

            // Set Admin-specific fields
            admin.setNom("Admin");
            admin.setPrenom("System");
            admin.setCin("ADMIN001");

            userRepository.save(admin);
            System.out.println("Admin user created with username 'admin' and password 'admin'");
        }
    }
}