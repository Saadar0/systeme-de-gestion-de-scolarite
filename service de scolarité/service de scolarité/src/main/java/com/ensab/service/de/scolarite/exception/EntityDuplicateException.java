package com.ensab.service.de.scolarite.exception;

public class EntityDuplicateException extends RuntimeException {
    public EntityDuplicateException(final String message) {
        super(message);
    }
}