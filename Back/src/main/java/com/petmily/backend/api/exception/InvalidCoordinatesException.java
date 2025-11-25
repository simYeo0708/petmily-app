package com.petmily.backend.api.exception;

public class InvalidCoordinatesException extends CustomException {

    public InvalidCoordinatesException() {
        super(ErrorCode.INVALID_COORDINATES);
    }

    public InvalidCoordinatesException(String message) {
        super(ErrorCode.INVALID_COORDINATES, message);
    }

    public InvalidCoordinatesException(Double latitude, Double longitude) {
        super(ErrorCode.INVALID_COORDINATES, 
              String.format("잘못된 좌표입니다. 위도: %f, 경도: %f", latitude, longitude));
    }
}