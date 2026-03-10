package com.goodsplatform.dto.response;

import com.goodsplatform.entity.InventoryItem;
import com.goodsplatform.entity.RegistrationType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class InventoryItemResponseDto {

    private Long inventoryId;

    // 도감(Master) 데이터 연결 시 이름
    private Long collectionItemId;
    private String collectionItemName;

    // 도감 컬렉션 연결
    private Long collectionId;
    private String collectionName;

    // 카테고리 정보
    private Long categoryId;
    private String categoryName;

    // 미등록 시 직접 입력한 이름
    private String customName;

    private Integer quantity;

    private RegistrationType regType;
    private BigDecimal aiConfidence;
    private String location;
    private String userImageUrl;
    private String note;
    private BigDecimal purchasedPrice;
    private LocalDateTime purchasedAt;
    private LocalDateTime createdAt;

    /**
     * 노출할 대표 이름 결정 (공식 도감 우선)
     */
    public String getDisplayName() {
        return (collectionItemName != null && !collectionItemName.isBlank())
                ? collectionItemName
                : customName;
    }

    public static InventoryItemResponseDto from(InventoryItem inventoryItem) {
        String masterName = inventoryItem.getItem() != null ? inventoryItem.getItem().getName() : null;
        Long masterId = inventoryItem.getItem() != null ? inventoryItem.getItem().getItemId() : null;
        
        Long collectionId = inventoryItem.getCollection() != null ? inventoryItem.getCollection().getCollectionId() : null;
        String collectionName = inventoryItem.getCollection() != null ? inventoryItem.getCollection().getName() : null;
        
        Long categoryId = inventoryItem.getCategory() != null ? inventoryItem.getCategory().getCategoryId() : null;
        String categoryName = inventoryItem.getCategory() != null ? inventoryItem.getCategory().getName() : null;

        return InventoryItemResponseDto.builder()
                .inventoryId(inventoryItem.getInventoryId())
                .collectionItemId(masterId)
                .collectionItemName(masterName)
                .collectionId(collectionId)
                .collectionName(collectionName)
                .categoryId(categoryId)
                .categoryName(categoryName)
                .customName(inventoryItem.getCustomName())
                .quantity(inventoryItem.getQuantity())
                .regType(inventoryItem.getRegType())
                .aiConfidence(inventoryItem.getAiConfidence())
                .location(inventoryItem.getLocation())
                .userImageUrl(inventoryItem.getUserImageUrl())
                .note(inventoryItem.getNote())
                .purchasedPrice(inventoryItem.getPurchasedPrice())
                .purchasedAt(inventoryItem.getPurchasedAt())
                .createdAt(inventoryItem.getCreatedAt())
                .build();
    }
}
