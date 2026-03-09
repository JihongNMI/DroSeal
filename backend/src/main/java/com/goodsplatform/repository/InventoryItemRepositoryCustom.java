package com.goodsplatform.repository;

import com.goodsplatform.dto.request.InventorySearchCondition;
import com.goodsplatform.entity.InventoryItem;
import com.goodsplatform.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InventoryItemRepositoryCustom {
    /**
     * 유저의 인벤토리 목록을 다중 조건(키워드, 등록 타입 등)으로 페이징 검색
     */
    Page<InventoryItem> searchInventory(User user, InventorySearchCondition condition, Pageable pageable);
}
