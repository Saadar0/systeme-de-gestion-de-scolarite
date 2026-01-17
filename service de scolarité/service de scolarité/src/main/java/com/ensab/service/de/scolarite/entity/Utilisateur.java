package com.ensab.service.de.scolarite.entity;

import com.ensab.service.de.scolarite.enums.Role;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Inheritance(strategy = InheritanceType.JOINED)
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomUtilisateur;
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    private Role role;
}
