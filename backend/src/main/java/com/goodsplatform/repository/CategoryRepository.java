package com.goodsplatform.repository;

import com.goodsplatform.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, CategoryRepositoryCustom {

    /**
     * 특정 부모를 가진 하위 카테고리 목록 조회
     */
    List<Category> findByParent_CategoryId(Long parentId);

    /**
     * 부모가 없는 최상위(Root) 카테고리 목록 조회
     */
    List<Category> findByParentIsNull();

    boolean existsByNameAndParent(String name, Category parent);

    boolean existsByNameAndParentIsNull(String name);
}
