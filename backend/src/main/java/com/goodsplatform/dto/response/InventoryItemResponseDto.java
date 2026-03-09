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

    // 미등록 시 직접 입력한 이름
    private String customName;

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

        return InventoryItemResponseDto.builder()
                .inventoryId(inventoryItem.getInventoryId())
                .collectionItemId(masterId)
                .collectionItemName(masterName)
                .customName(inventoryItem.getCustomName())
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
