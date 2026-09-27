package com.telemed.exception;

import org.springframework.http.HttpStatus;

/**
 * A simple runtime exception that carries an HTTP status code.
 * Used throughout the service layer instead of generic RuntimeException
 * so GlobalExceptionHandler can return the right HTTP status.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
