package com.goodsplatform.repository;

import com.goodsplatform.entity.Category;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.goodsplatform.entity.QCategory.category;

@Repository
@RequiredArgsConstructor
public class CategoryRepositoryCustomImpl implements CategoryRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Category> findByPathStartingWithCustom(String pathPrefix) {
        return queryFactory.selectFrom(category)
                // "1/5/" 와 같이 특정 path 형식을 접두어로 갖는 레코드 조회
                .where(category.path.startsWith(pathPrefix))
                .fetch();
    }
}
