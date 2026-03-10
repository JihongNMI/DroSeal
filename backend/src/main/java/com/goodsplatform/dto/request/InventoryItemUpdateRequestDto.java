package com.goodsplatform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemUpdateRequestDto {
    private Long collectionId;
    private Long categoryId;
    private String customName;
    private Integer quantity;
    private String location;
    private String userImageUrl;
    private String note;
    private BigDecimal purchasedPrice;
    private LocalDateTime purchasedAt;
}
