package com.ensab.service.de.scolarite.service;

import com.ensab.service.de.scolarite.enums.TypeDocument;

import java.util.concurrent.CompletableFuture;

public interface DocumentGenerationService {
    CompletableFuture<byte[]> generateDocument(TypeDocument type, Long etudiantId);
    CompletableFuture<byte[]> generateAttestation(Long etudiantId);
    CompletableFuture<byte[]> generateReleveDeNotes(Long etudiantId);
}