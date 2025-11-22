package com.petmily.backend.api.walk.dto.tracking.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoUploadRequest {
    private String photoUrl;
    private String photoType; // START, MIDDLE, END
    private String location; // latitude,longitude format at the time of photo
    private String notes;
}