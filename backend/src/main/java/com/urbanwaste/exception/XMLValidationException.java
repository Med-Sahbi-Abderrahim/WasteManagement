package com.urbanwaste.exception;

/**
 * Custom exception for XML validation errors against XSD schemas
 */
public class XMLValidationException extends Exception {
    
    public XMLValidationException(String message) {
        super(message);
    }
    
    public XMLValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}

