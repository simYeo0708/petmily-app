package com.petmily.backend.api.auth.exception;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;

public class TokenException extends CustomException {

    public TokenException(ErrorCode errorCode){
        super(errorCode);
    }
}
