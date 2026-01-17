package com.ensab.service.de.scolarite.dto.reclamation;

import lombok.Data;

@Data
public class ReclamationRequestDTO {
    private String email;
    private int codeApogee;
    private String cin;
    
    private String sujet;
    private String message;
    private String reponse;
}
