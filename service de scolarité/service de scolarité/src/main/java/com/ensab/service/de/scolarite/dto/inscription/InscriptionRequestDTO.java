package com.ensab.service.de.scolarite.dto.inscription;

import com.ensab.service.de.scolarite.enums.TypeInscription;
import lombok.Data;

@Data
public class InscriptionRequestDTO {
    private Long etudiantId;  // Changed from email, codeApogee, cin
    private TypeInscription typeInscription;
    private String anneeUniversitaire;
}