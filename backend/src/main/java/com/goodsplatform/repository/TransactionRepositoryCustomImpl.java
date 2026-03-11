package com.goodsplatform.repository;

import com.goodsplatform.dto.request.TransactionSearchCondition;
import com.goodsplatform.entity.QTransaction;
import com.goodsplatform.entity.QUser;
import com.goodsplatform.entity.Transaction;
import com.goodsplatform.entity.TransactionType;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class TransactionRepositoryCustomImpl implements TransactionRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Transaction> searchTransactions(Long userId, TransactionSearchCondition condition, Pageable pageable) {
        QTransaction t = QTransaction.transaction;
        com.goodsplatform.entity.QInventoryItem inv = com.goodsplatform.entity.QInventoryItem.inventoryItem;
        com.goodsplatform.entity.QCollectionItem item = com.goodsplatform.entity.QCollectionItem.collectionItem;
        QUser seller = new QUser("seller");
        QUser buyer = new QUser("buyer");

        List<Transaction> content = queryFactory
                .selectFrom(t)
                .leftJoin(t.inventory, inv).fetchJoin()
                .leftJoin(inv.item, item).fetchJoin()
                .leftJoin(t.seller, seller)
                .leftJoin(t.buyer, buyer)
                .where(
                        userEq(userId, seller, buyer),
                        typeEq(condition.getType()),
                        dateBetween(condition.getStartDate(), condition.getEndDate()),
                        platformEq(condition.getPlatform()))
                .orderBy(t.transactionDate.desc(), t.createdAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        QUser sellerC = new QUser("sellerC");
        QUser buyerC = new QUser("buyerC");
        Long total = queryFactory
                .select(t.count())
                .from(t)
                .leftJoin(t.seller, sellerC)
                .leftJoin(t.buyer, buyerC)
                .where(
                        userEq(userId, sellerC, buyerC),
                        typeEq(condition.getType()),
                        dateBetween(condition.getStartDate(), condition.getEndDate()),
                        platformEq(condition.getPlatform()))
                .fetchOne();

        long totalCount = total != null ? total : 0L;
        return new PageImpl<>(content, pageable, totalCount);
    }

    @Override
    public List<Transaction> findAllTransactionsForSummary(Long userId, TransactionSearchCondition condition) {
        QTransaction t = QTransaction.transaction;
        com.goodsplatform.entity.QInventoryItem inv = com.goodsplatform.entity.QInventoryItem.inventoryItem;
        com.goodsplatform.entity.QCollectionItem item = com.goodsplatform.entity.QCollectionItem.collectionItem;
        QUser seller = new QUser("seller");
        QUser buyer = new QUser("buyer");

        return queryFactory
                .selectFrom(t)
                .leftJoin(t.inventory, inv).fetchJoin()
                .leftJoin(inv.item, item).fetchJoin()
                .leftJoin(t.seller, seller)
                .leftJoin(t.buyer, buyer)
                .where(
                        userEq(userId, seller, buyer),
                        typeEq(condition.getType()),
                        dateBetween(condition.getStartDate(), condition.getEndDate()),
                        platformEq(condition.getPlatform()))
                .fetch();
    }

    private BooleanExpression userEq(Long userId, QUser seller, QUser buyer) {
        if (userId == null)
            return null;
        return seller.userId.eq(userId).or(buyer.userId.eq(userId));
    }

    private BooleanExpression typeEq(TransactionType type) {
        return type != null ? QTransaction.transaction.transactionType.eq(type) : null;
    }

    private BooleanExpression dateBetween(LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return null;
        } else if (startDate != null && endDate == null) {
            return QTransaction.transaction.transactionDate.goe(startDate);
        } else if (startDate == null && endDate != null) {
            return QTransaction.transaction.transactionDate.loe(endDate);
        } else {
            return QTransaction.transaction.transactionDate.between(startDate, endDate);
        }
    }

    private BooleanExpression platformEq(String platform) {
        return (platform != null && !platform.trim().isEmpty())
                ? QTransaction.transaction.platform.eq(platform)
                : null;
    }
}
