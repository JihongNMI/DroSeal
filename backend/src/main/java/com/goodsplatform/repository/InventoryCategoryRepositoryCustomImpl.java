package com.goodsplatform.repository;

import com.goodsplatform.entity.InventoryCategory;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.goodsplatform.entity.QInventoryCategory.inventoryCategory;

@Repository
@RequiredArgsConstructor
public class InventoryCategoryRepositoryCustomImpl implements InventoryCategoryRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<InventoryCategory> findByPathStartingWithCustom(String pathPrefix) {
        return queryFactory.selectFrom(inventoryCategory)
                // "1/5/" 와 같이 특정 path 형식을 접두어로 갖는 레코드 조회
                .where(inventoryCategory.path.startsWith(pathPrefix))
                .fetch();
    }
}
