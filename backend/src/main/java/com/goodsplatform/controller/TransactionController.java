package com.goodsplatform.controller;

import com.goodsplatform.dto.request.TransactionCreateRequestDto;
import com.goodsplatform.dto.request.TransactionSearchCondition;
import com.goodsplatform.dto.response.AccountingSummaryResponseDto;
import com.goodsplatform.dto.response.TransactionResponseDto;
import com.goodsplatform.entity.User;
import com.goodsplatform.repository.UserRepository;
import com.goodsplatform.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/accounting")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    // TODO: Spring Security 적용 후 (@AuthenticationPrincipal User user) 로 변경해야 함
    private User getCurrentMockUser() {
        return userRepository.findByUsername("testUser")
                .orElseGet(() -> userRepository.findById(1L)
                        .orElseThrow(() -> new RuntimeException("테스트용 유저를 찾을 수 없습니다.")));
    }

    @PostMapping("/transactions")
    public ResponseEntity<TransactionResponseDto> createTransaction(
            @Valid @RequestBody TransactionCreateRequestDto request) {

        User user = getCurrentMockUser();
        TransactionResponseDto response = transactionService.addTransaction(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<TransactionResponseDto>> getTransactions(
            @ModelAttribute TransactionSearchCondition condition,
            @PageableDefault(size = 20) Pageable pageable) {

        User user = getCurrentMockUser();
        Page<TransactionResponseDto> response = transactionService.getMyTransactions(user, condition, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<AccountingSummaryResponseDto> getAccountingSummary(
            @ModelAttribute TransactionSearchCondition condition) {
        User user = getCurrentMockUser();
        AccountingSummaryResponseDto response = transactionService.getAccountingSummary(user, condition);
        return ResponseEntity.ok(response);
    }
}
