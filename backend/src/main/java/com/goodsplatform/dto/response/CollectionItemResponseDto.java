package com.goodsplatform.dto.response;

import com.goodsplatform.entity.CollectionItem;
import com.goodsplatform.entity.Rarity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CollectionItemResponseDto {

    private Long itemId;
    private Long collectionId;
    private Integer itemNumber;
    private String name;
    private Rarity rarity;
    private String imageUrl;
    private String vectorId;
    private String description;
    private String imageHash;
    private Boolean isOfficial;
    private Boolean isOwned;
    private LocalDateTime createdAt;

    public static CollectionItemResponseDto from(CollectionItem item) {
        return CollectionItemResponseDto.builder()
                .itemId(item.getItemId())
                .collectionId(item.getCollection() != null ? item.getCollection().getCollectionId() : null)
                .itemNumber(item.getItemNumber())
                .name(item.getName())
                .rarity(item.getRarity())
                .imageUrl(item.getImageUrl())
                .vectorId(item.getVectorId())
                .description(item.getDescription())
                .imageHash(item.getImageHash())
                .isOfficial(item.getIsOfficial())
                .createdAt(item.getCreatedAt())
                .build();
    }

    public static CollectionItemResponseDto from(CollectionItem item, boolean isOwned) {
        return CollectionItemResponseDto.builder()
                .itemId(item.getItemId())
                .collectionId(item.getCollection() != null ? item.getCollection().getCollectionId() : null)
                .itemNumber(item.getItemNumber())
                .name(item.getName())
                .rarity(item.getRarity())
                .imageUrl(item.getImageUrl())
                .vectorId(item.getVectorId())
                .description(item.getDescription())
                .imageHash(item.getImageHash())
                .isOfficial(item.getIsOfficial())
                .isOwned(isOwned)
                .createdAt(item.getCreatedAt())
                .build();
    }
}
