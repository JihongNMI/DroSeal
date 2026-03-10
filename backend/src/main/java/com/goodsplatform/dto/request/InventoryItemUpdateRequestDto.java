package com.goodsplatform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    @com.fasterxml.jackson.annotation.JsonProperty("userImageUrl")
    private String userImageUrl;
    private String note;
    private BigDecimal purchasedPrice;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime purchasedAt;
}
