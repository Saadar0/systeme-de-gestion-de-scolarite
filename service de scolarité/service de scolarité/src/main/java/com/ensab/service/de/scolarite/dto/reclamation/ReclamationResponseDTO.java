package com.ensab.service.de.scolarite.dto.reclamation;

import com.ensab.service.de.scolarite.dto.etudiant.EtudiantBasicDTO;
import com.ensab.service.de.scolarite.enums.StatusReclamation;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

@Data
public class ReclamationResponseDTO {
    private Long id;
    private String sujet;
    private String message;
    private StatusReclamation status;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date dateCreation;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date dateTraitement;
    private String reponse;
    private EtudiantBasicDTO etudiant;
}