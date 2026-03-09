package com.goodsplatform.dto.response;

import com.goodsplatform.entity.Transaction;
import com.goodsplatform.entity.TransactionStatus;
import com.goodsplatform.entity.TransactionType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class TransactionResponseDto {

    private Long transactionId;
    private TransactionType transactionType;
    private BigDecimal price;
    private String platform;
    private String receiptImageUrl;
    private TransactionStatus status;
    private LocalDate transactionDate;
    private LocalDateTime createdAt;

    // 추가 정보: 연결된 인벤토리 아이템 이름
    private Long inventoryId;
    private String inventoryItemName;

    public static TransactionResponseDto from(Transaction sub) {
        String itemName = sub.getInventory() != null ? sub.getInventory().getCustomName() : null;
        if (itemName == null && sub.getInventory() != null && sub.getInventory().getItem() != null) {
            itemName = sub.getInventory().getItem().getName();
        }

        Long inventoryId = sub.getInventory() != null ? sub.getInventory().getInventoryId() : null;

        return TransactionResponseDto.builder()
                .transactionId(sub.getTransactionId())
                .transactionType(sub.getTransactionType())
                .price(sub.getPrice())
                .platform(sub.getPlatform())
                .receiptImageUrl(sub.getReceiptImageUrl())
                .status(sub.getStatus())
                .transactionDate(sub.getTransactionDate())
                .createdAt(sub.getCreatedAt())
                .inventoryId(inventoryId)
                .inventoryItemName(itemName)
                .build();
    }
}
