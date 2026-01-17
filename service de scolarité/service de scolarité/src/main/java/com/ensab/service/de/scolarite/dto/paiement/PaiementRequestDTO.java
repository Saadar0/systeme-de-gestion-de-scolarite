package com.ensab.service.de.scolarite.dto.paiement;

import com.ensab.service.de.scolarite.enums.TypePaiement;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaiementRequestDTO {
    private String email;
    private int codeApogee;
    private String cin;

    private TypePaiement typePaiement;
    private BigDecimal montant;
}