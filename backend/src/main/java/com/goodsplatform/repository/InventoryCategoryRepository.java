package com.goodsplatform.repository;

import com.goodsplatform.entity.InventoryCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryCategoryRepository extends JpaRepository<InventoryCategory, Long>, InventoryCategoryRepositoryCustom {

    /**
     * 특정 부모를 가진 하위 카테고리 목록 조회
     */
    List<InventoryCategory> findByParent_CategoryId(Long parentId);

    /**
     * 부모가 없는 최상위(Root) 카테고리 목록 조회
     */
    List<InventoryCategory> findByParentIsNull();

    boolean existsByNameAndParent(String name, InventoryCategory parent);

    boolean existsByNameAndParentIsNull(String name);
}
