package com.ensab.service.de.scolarite.dto.paiement;

import com.ensab.service.de.scolarite.dto.etudiant.EtudiantBasicDTO;
import com.ensab.service.de.scolarite.enums.StatusPaiement;
import com.ensab.service.de.scolarite.enums.TypePaiement;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class PaiementResponseDTO {
    private Long id;
    private TypePaiement typePaiement;
    private StatusPaiement status;
    private BigDecimal montant;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date dateCreation;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date datePaiement;
    private EtudiantBasicDTO etudiant;
}