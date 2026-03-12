package com.goodsplatform.dto.response;

import com.goodsplatform.entity.CursorSkin;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CursorSkinResponseDto {

    private Long id;
    private String name;
    private String characterName;
    private String folderPath;
    private Integer frameCount;
    private Integer frameTime;

    public static CursorSkinResponseDto from(CursorSkin cursorSkin) {
        return CursorSkinResponseDto.builder()
                .id(cursorSkin.getId())
                .name(cursorSkin.getName())
                .characterName(cursorSkin.getCharacterName())
                .folderPath(cursorSkin.getFolderPath())
                .frameCount(cursorSkin.getFrameCount())
                .frameTime(cursorSkin.getFrameTime())
                .build();
    }
}
