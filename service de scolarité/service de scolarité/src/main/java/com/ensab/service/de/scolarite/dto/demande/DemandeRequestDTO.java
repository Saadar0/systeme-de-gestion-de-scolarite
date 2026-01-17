package com.ensab.service.de.scolarite.dto.demande;

import com.ensab.service.de.scolarite.enums.TypeDocument;
import lombok.Data;

@Data
public class DemandeRequestDTO {
    private String email;
    private int codeApogee;
    private String cin;
    
    private TypeDocument typeDocument;
}
