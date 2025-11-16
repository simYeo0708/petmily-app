package com.petmily.backend.api.mall.dto.review.request;

import com.petmily.backend.domain.mall.review.entity.ReviewHelpful;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewHelpfulRequest {

    @NotNull
    private ReviewHelpful.HelpfulType type;

}
