package com.goodsplatform.dto.response;

import com.goodsplatform.entity.CursorSkin;
import com.goodsplatform.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponseDto {

    private Long userId;
    private String username;
    private Long cursorSkinId;
    private String cursorSkinCharacterName;
    private String cursorSkinFolderPath;
    private Integer frameCount;
    private Integer frameTime;

    public static UserResponseDto from(User user) {
        CursorSkin skin = user.getCursorSkin();
        return UserResponseDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .cursorSkinId(skin != null ? skin.getId() : null)
                .cursorSkinCharacterName(skin != null ? skin.getCharacterName() : null)
                .cursorSkinFolderPath(skin != null ? skin.getFolderPath() : null)
                .frameCount(skin != null ? skin.getFrameCount() : null)
                .frameTime(skin != null ? skin.getFrameTime() : null)
                .build();
    }
}
