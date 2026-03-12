package com.goodsplatform.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserCursorSkinUpdateRequestDto {

    @NotNull
    private Long cursorSkinId;
}
