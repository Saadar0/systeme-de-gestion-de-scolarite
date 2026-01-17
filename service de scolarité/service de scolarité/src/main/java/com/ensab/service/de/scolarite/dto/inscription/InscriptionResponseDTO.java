package com.ensab.service.de.scolarite.dto.inscription;

import com.ensab.service.de.scolarite.dto.admin.AdminBasicDTO;
import com.ensab.service.de.scolarite.dto.etudiant.EtudiantBasicDTO;
import com.ensab.service.de.scolarite.enums.StatusInscription;
import com.ensab.service.de.scolarite.enums.TypeInscription;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

@Data
public class InscriptionResponseDTO {
    private Long id;
    private TypeInscription typeInscription;
    private StatusInscription status;
    private String anneeUniversitaire;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private Date dateCreation;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private Date dateConfirmation;
    private EtudiantBasicDTO etudiant;
    private AdminBasicDTO admin;
}