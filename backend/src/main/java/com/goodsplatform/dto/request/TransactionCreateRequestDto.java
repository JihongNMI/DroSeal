package com.goodsplatform.dto.request;

import com.goodsplatform.entity.TransactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TransactionCreateRequestDto {

    @NotNull(message = "거래 종류(PURCHASE/SALE)는 필수입니다.")
    private TransactionType transactionType;

    @NotNull(message = "거래 가격은 필수입니다.")
    private BigDecimal price;

    private String platform;

    @NotNull(message = "거래 일자는 필수입니다.")
    private LocalDate transactionDate;

    // 선택적: 이 거래 내역을 기존 인벤토리 아이템과 연결할 때 사용
    private Long inventoryId;

    // 선택적: 영수증이나 거래 증빙 이미지 URL
    private String receiptImageUrl;
}
