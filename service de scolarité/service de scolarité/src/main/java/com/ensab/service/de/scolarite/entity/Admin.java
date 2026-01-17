package com.ensab.service.de.scolarite.entity;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class Admin extends Utilisateur {
    private String nom;
    private String prenom;
    private String cin;
}