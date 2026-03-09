package com.goodsplatform.repository;

import com.goodsplatform.dto.request.TransactionSearchCondition;
import com.goodsplatform.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface TransactionRepositoryCustom {
    Page<Transaction> searchTransactions(Long userId, TransactionSearchCondition condition, Pageable pageable);

    List<Transaction> findAllTransactionsForSummary(Long userId, TransactionSearchCondition condition);
}
