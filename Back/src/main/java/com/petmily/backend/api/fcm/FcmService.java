package com.petmily.backend.api.fcm;

import com.petmily.backend.api.fcm.dto.FcmResponseDto;
import com.petmily.backend.api.fcm.dto.FcmSendDto;

public interface FcmService {

    FcmResponseDto sendMessageTo(FcmSendDto fcmSendDto);

}
