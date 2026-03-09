package com.goodsplatform.dto.request;

import com.goodsplatform.entity.TransactionType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TransactionSearchCondition {

    private TransactionType type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String platform;

}
