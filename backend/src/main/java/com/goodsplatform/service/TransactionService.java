package com.goodsplatform.service;

import com.goodsplatform.dto.request.TransactionCreateRequestDto;
import com.goodsplatform.dto.request.TransactionSearchCondition;
import com.goodsplatform.dto.response.AccountingSummaryResponseDto;
import com.goodsplatform.dto.response.TransactionResponseDto;
import com.goodsplatform.entity.InventoryItem;
import com.goodsplatform.entity.Transaction;
import com.goodsplatform.entity.TransactionStatus;
import com.goodsplatform.entity.TransactionType;
import com.goodsplatform.entity.User;
import com.goodsplatform.repository.InventoryItemRepository;
import com.goodsplatform.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final InventoryItemRepository inventoryItemRepository;

    /**
     * 거래 내역 추가 (가계부 기록)
     */
    @Transactional
    public TransactionResponseDto addTransaction(User user, TransactionCreateRequestDto request) {

        InventoryItem inventoryItem = null;

        // 인벤토리 아이템이 연결된 거래인 경우 (옵션)
        if (request.getInventoryId() != null) {
            inventoryItem = inventoryItemRepository.findById(request.getInventoryId())
                    .orElseThrow(
                            () -> new IllegalArgumentException("존재하지 않는 인벤토리 아이템입니다: " + request.getInventoryId()));

            // 보안 검증 (판매 시 내 인벤토리가 맞는지 확인)
            if (request.getTransactionType() == TransactionType.SALE) {
                if (!inventoryItem.getUser().getUserId().equals(user.getUserId())) {
                    throw new IllegalArgumentException("판매 거래는 본인 소유의 인벤토리 아이템만 등록할 수 있습니다.");
                }
            }
        } else if (request.getTransactionType() == TransactionType.SALE) {
            // SALE 인데 연결 아이템이 없는 경우를 막을지 허용할지는 정책에 따라 다르지만
            // 일단 '구매 내역이 없는 판매' 도 가능하도록 열어둡니다.
        }

        Transaction transaction = Transaction.builder()
                .seller(request.getTransactionType() == TransactionType.SALE ? user : null) // 내가 팔았으면 seller
                .buyer(request.getTransactionType() == TransactionType.PURCHASE ? user : null) // 내가 샀으면 buyer
                .inventory(inventoryItem)
                .transactionType(request.getTransactionType())
                .price(request.getPrice())
                .platform(request.getPlatform())
                .receiptImageUrl(request.getReceiptImageUrl())
                .transactionDate(request.getTransactionDate())
                .status(TransactionStatus.COMPLETED)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        return TransactionResponseDto.from(savedTransaction);
    }

    /**
     * 내 가계부 내역(Transactions) 페이징 조회
     */
    public Page<TransactionResponseDto> getMyTransactions(User user, TransactionSearchCondition condition,
            Pageable pageable) {
        return transactionRepository.searchTransactions(user.getUserId(), condition, pageable)
                .map(TransactionResponseDto::from);
    }

    /**
     * 회계 요약 정보 로드 (사업 소득, 기타 소득 분리)
     */
    public AccountingSummaryResponseDto getAccountingSummary(User user, TransactionSearchCondition condition) {
        List<Transaction> transactions = transactionRepository.findAllTransactionsForSummary(user.getUserId(),
                condition);

        BigDecimal businessIncome = BigDecimal.ZERO;
        BigDecimal miscellaneousIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (t.getTransactionType() == TransactionType.PURCHASE) {
                totalExpense = totalExpense.add(t.getPrice());
            } else if (t.getTransactionType() == TransactionType.SALE) {
                BigDecimal salePrice = t.getPrice();
                if (t.getInventory() != null && t.getInventory().getPurchasedPrice() != null) {
                    BigDecimal purchasedPrice = t.getInventory().getPurchasedPrice();
                    BigDecimal profit = salePrice.subtract(purchasedPrice);
                    businessIncome = businessIncome.add(profit); // 사업 소득
                } else {
                    miscellaneousIncome = miscellaneousIncome.add(salePrice); // 기타 소득
                }
            }
        }

        BigDecimal totalRevenue = businessIncome.add(miscellaneousIncome);
        BigDecimal netIncome = totalRevenue.subtract(totalExpense);

        return AccountingSummaryResponseDto.builder()
                .totalRevenue(totalRevenue)
                .businessIncome(businessIncome)
                .miscellaneousIncome(miscellaneousIncome)
                .totalExpense(totalExpense)
                .netIncome(netIncome)
                .build();
    }
}
