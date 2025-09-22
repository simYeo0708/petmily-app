package com.petmily.backend.api.exception;

public class LocationRequiredException extends CustomException {

    public LocationRequiredException() {
        super(ErrorCode.LOCATION_REQUIRED);
    }

    public LocationRequiredException(String message) {
        super(ErrorCode.LOCATION_REQUIRED, message);
    }

    public LocationRequiredException(ErrorCode errorCode) {
        super(errorCode);
    }

    public LocationRequiredException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}