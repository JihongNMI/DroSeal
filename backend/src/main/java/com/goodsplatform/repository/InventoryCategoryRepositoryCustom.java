package com.goodsplatform.repository;

import com.goodsplatform.entity.InventoryCategory;

import java.util.List;

public interface InventoryCategoryRepositoryCustom {
    /**
     * 특정 경로(path)로 시작하는 모든 하위 카테고리(트리) 일괄 조회
     * 예: "1/5" 로 조회하면 1번의 5번 자식 아래 모든 항목을 가져옵니다.
     */
    List<InventoryCategory> findByPathStartingWithCustom(String pathPrefix);
}
