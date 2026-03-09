package com.goodsplatform.dto.response;

import com.goodsplatform.entity.Collection;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CollectionProgressResponseDto {
    private Long collectionId;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private Boolean isOfficial;
    private Boolean isPublic;
    private Integer gridX;
    private Integer gridY;
    private LocalDateTime createdAt;

    // 이 도감에 속한 아이템 총 개수 (분모)
    private Integer totalItems;
    // 유저가 보유한 이 도감 소속 인벤토리 아이템 종류 개수 (분자)
    private Integer collectedItems;

    public static CollectionProgressResponseDto from(Collection collection, int total, int collected) {
        return CollectionProgressResponseDto.builder()
                .collectionId(collection.getCollectionId())
                .categoryId(collection.getCategory().getCategoryId())
                .categoryName(collection.getCategory().getName())
                .name(collection.getName())
                .description(collection.getDescription())
                .isOfficial(collection.getIsOfficial())
                .isPublic(collection.getIsPublic())
                .gridX(collection.getGridX())
                .gridY(collection.getGridY())
                .createdAt(collection.getCreatedAt())
                .totalItems(total)
                .collectedItems(collected)
                .build();
    }
}
