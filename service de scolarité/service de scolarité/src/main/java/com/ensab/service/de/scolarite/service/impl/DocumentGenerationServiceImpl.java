package com.ensab.service.de.scolarite.service.impl;

import com.ensab.service.de.scolarite.entity.Etudiant;
import com.ensab.service.de.scolarite.enums.TypeDocument;
import com.ensab.service.de.scolarite.exception.DocumentGenerationException;
import com.ensab.service.de.scolarite.exception.ResourceNotFoundException;
import com.ensab.service.de.scolarite.repository.EtudiantRepository;
import com.ensab.service.de.scolarite.service.DocumentGenerationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.CompletableFuture;


@Service
public class DocumentGenerationServiceImpl implements DocumentGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentGenerationServiceImpl.class);

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Override
    public CompletableFuture<byte[]> generateDocument(TypeDocument type, Long etudiantId) {
        return switch (type) {
            case ATTESTATION_SCOLARITE -> generateAttestation(etudiantId);
            case RELEVE_NOTES -> generateReleveDeNotes(etudiantId);
            default -> throw new DocumentGenerationException("Type de document non reconnu: " + type);
        };
    }

    @Async
    @Override
    public CompletableFuture<byte[]> generateAttestation(Long etudiantId) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant non trouvé avec l'id " + etudiantId));

        try {
            Context context = createContext(etudiant);
            String htmlContent = templateEngine.process("attestation", context);
            byte[] pdf = convertHtmlToPdf(htmlContent);
            return CompletableFuture.completedFuture(pdf);
        } catch (Exception e) {
            logger.error("Error generating attestation PDF for Etudiant ID {}: {}", etudiantId, e.getMessage());
            throw new DocumentGenerationException("Erreur lors de la génération du attestation PDF.", e);
        }
    }

    @Override
    public CompletableFuture<byte[]> generateReleveDeNotes(Long etudiantId) {
        Etudiant etudiant = etudiantRepository.findByIdWithNotes(etudiantId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant non trouvé avec l'id " + etudiantId));

        try {
            Context context = createContext(etudiant);
            String htmlContent = templateEngine.process("releve_de_notes", context);
            byte[] pdf = convertHtmlToPdf(htmlContent);
            return CompletableFuture.completedFuture(pdf);
        } catch (Exception e) {
            logger.error("Error generating relevé de notes PDF for Etudiant ID {}: {}", etudiantId, e.getMessage());
            throw new DocumentGenerationException("Erreur lors de la génération du relevé de notes PDF.", e);
        }
    }

    private Context createContext(Etudiant etudiant) {
        Context context = new Context();
        context.setVariable("etudiant", etudiant);
        context.setVariable("date", new SimpleDateFormat("dd/MM/yyyy").format(new Date()));
        return context;
    }

    private byte[] convertHtmlToPdf(String htmlContent) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();

            URL resource = getClass().getClassLoader().getResource("static/");
            String baseUrl = resource != null ? resource.toString() : "";
            renderer.setDocumentFromString(htmlContent, baseUrl);

            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            logger.error("Error converting HTML to PDF: {}", e.getMessage());
            throw new DocumentGenerationException("Erreur lors de la conversion HTML vers PDF", e);
        }
    }
}