package com.goodsplatform.repository;

import com.goodsplatform.entity.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, Long> {
    Page<Collection> findByCategories_CategoryId(Long categoryId, Pageable pageable);

    Page<Collection> findByNameContaining(String keyword, Pageable pageable);

    Page<Collection> findByCategories_CategoryIdAndNameContaining(Long categoryId, String keyword, Pageable pageable);
}
