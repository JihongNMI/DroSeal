package com.goodsplatform.dto.request;

import com.goodsplatform.entity.RegistrationType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventorySearchCondition {
    private String keyword; // customName 또는 note에 포함된 키워드
    private RegistrationType regType; // MANUAL 또는 AUTO
    private String categoryPathPrefix; // 특정 카테고리 하위의 도감 아이템 대상일 경우
}
