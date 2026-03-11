package com.goodsplatform.repository;

import com.goodsplatform.dto.request.ItemSearchCondition;
import com.goodsplatform.entity.CollectionItem;
import com.goodsplatform.entity.QCollection;
import com.goodsplatform.entity.QCollectionItem;
import com.goodsplatform.entity.QInventoryCategory;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CollectionItemRepositoryCustomImpl implements CollectionItemRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<CollectionItem> searchHybrid(ItemSearchCondition condition, Pageable pageable) {
        QCollection collection = QCollection.collection;
        QCollectionItem collectionItem = QCollectionItem.collectionItem;
        QInventoryCategory inventoryCategory = QInventoryCategory.inventoryCategory;

        // 1. 데이터 페치 쿼리 (컬렉션과 카테고리는 N+1 방지를 위해 fetchJoin)
        List<CollectionItem> content = queryFactory
                .selectFrom(collectionItem)
                .leftJoin(collectionItem.collection, collection).fetchJoin()
                .leftJoin(collection.categories, inventoryCategory).fetchJoin()
                .where(
                        categoryPathStartsWith(condition.getCategoryPathPrefix()),
                        keywordContains(condition.getKeyword()))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(collectionItem.createdAt.desc())
                .fetch();

        // 2. 전체 Count 쿼리
        JPAQuery<Long> countQuery = queryFactory
                .select(collectionItem.count())
                .from(collectionItem)
                .leftJoin(collectionItem.collection, collection)
                .leftJoin(collection.categories, inventoryCategory)
                .where(
                        categoryPathStartsWith(condition.getCategoryPathPrefix()),
                        keywordContains(condition.getKeyword()));

        Long count = countQuery.fetchOne();
        return new PageImpl<>(content, pageable, count != null ? count : 0L);
    }

    /**
     * 카테고리 계층 필터 조건
     * 예: "1/5" 로 시작하는 모든 아이템 조회
     */
    private BooleanExpression categoryPathStartsWith(String pathPrefix) {
        if (pathPrefix == null || pathPrefix.isBlank()) {
            return null;
        }
        // Querydsl의 startsWith()는 내부적으로 LIKE '1/5%' 로 변환됨
        return QInventoryCategory.inventoryCategory.path.startsWith(pathPrefix);
    }

    /**
     * 텍스트 키워드 부분 검색
     * 아이템 이름 또는 상세 설명에 포함되는지 확인
     */
    private BooleanExpression keywordContains(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        return QCollectionItem.collectionItem.name.containsIgnoreCase(keyword)
                .or(QCollectionItem.collectionItem.description.containsIgnoreCase(keyword));
    }
}
