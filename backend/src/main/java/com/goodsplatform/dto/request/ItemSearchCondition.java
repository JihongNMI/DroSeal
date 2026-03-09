package com.goodsplatform.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ItemSearchCondition {

    /**
     * 카테고리 계층 필터 조건 (예: 1번 대분류의 5번 중분류라면 "1/5")
     * null이거나 빈 값이면 카테고리 필터 미적용 (모든 카테고리 대상)
     */
    private String categoryPathPrefix;

    /**
     * 텍스트 키워드 부분 검색 (아이템명, 설명 등에 적용)
     */
    private String keyword;
}
