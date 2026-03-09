package com.goodsplatform.repository;

import com.goodsplatform.dto.request.ItemSearchCondition;
import com.goodsplatform.entity.CollectionItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CollectionItemRepositoryCustom {

    /**
     * 계층형 카테고리 필터와 텍스트 키워드(이름) 검색을 동시에 지원하는 하이브리드 검색
     */
    Page<CollectionItem> searchHybrid(ItemSearchCondition condition, Pageable pageable);
}
