package com.goodsplatform.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AccountingSummaryResponseDto {
    private BigDecimal totalRevenue; // 총 수익 금액
    private BigDecimal businessIncome; // 사업 소득 (판매가 - 구매가)
    private BigDecimal miscellaneousIncome; // 기타 소득 (구매가가 없는 판매건)
    private BigDecimal totalExpense; // 총 지출
    private BigDecimal netIncome; // 순수익
}
