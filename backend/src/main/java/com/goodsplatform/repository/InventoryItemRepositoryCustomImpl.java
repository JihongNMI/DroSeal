package com.goodsplatform.repository;

import com.goodsplatform.dto.request.InventorySearchCondition;
import com.goodsplatform.entity.InventoryItem;
import com.goodsplatform.entity.RegistrationType;
import com.goodsplatform.entity.User;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.goodsplatform.entity.QCategory.category;
import static com.goodsplatform.entity.QCollectionItem.collectionItem;
import static com.goodsplatform.entity.QInventoryItem.inventoryItem;

@Repository
@RequiredArgsConstructor
public class InventoryItemRepositoryCustomImpl implements InventoryItemRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<InventoryItem> searchInventory(User user, InventorySearchCondition condition, Pageable pageable) {

        List<InventoryItem> content = queryFactory
                .selectFrom(inventoryItem)
                .leftJoin(inventoryItem.item, collectionItem).fetchJoin()
                .where(
                        inventoryItem.user.eq(user),
                        keywordContains(condition.getKeyword()),
                        regTypeEq(condition.getRegType()))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(inventoryItem.createdAt.desc())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(inventoryItem.count())
                .from(inventoryItem)
                .leftJoin(inventoryItem.item, collectionItem)
                .where(
                        inventoryItem.user.eq(user),
                        keywordContains(condition.getKeyword()),
                        regTypeEq(condition.getRegType()));

        return new PageImpl<>(content, pageable, countQuery.fetchOne() != null ? countQuery.fetchOne() : 0L);
    }

    private BooleanExpression keywordContains(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        return inventoryItem.customName.containsIgnoreCase(keyword)
                .or(inventoryItem.note.containsIgnoreCase(keyword))
                .or(collectionItem.name.containsIgnoreCase(keyword));
    }

    private BooleanExpression regTypeEq(RegistrationType regType) {
        return regType != null ? inventoryItem.regType.eq(regType) : null;
    }
}
