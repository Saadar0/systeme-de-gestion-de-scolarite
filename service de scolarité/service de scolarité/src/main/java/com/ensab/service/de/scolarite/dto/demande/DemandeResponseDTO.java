package com.ensab.service.de.scolarite.dto.demande;

import com.ensab.service.de.scolarite.dto.admin.AdminBasicDTO;
import com.ensab.service.de.scolarite.dto.etudiant.EtudiantBasicDTO;
import com.ensab.service.de.scolarite.enums.StatusDemande;
import com.ensab.service.de.scolarite.enums.TypeDocument;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

@Data
public class DemandeResponseDTO {
    private Long id;
    private TypeDocument typeDocument;
    private StatusDemande status;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date dateCreation;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date dateTraitement;
    private EtudiantBasicDTO etudiant;
    private AdminBasicDTO admin;
    private String asyncErrorMessage;
}