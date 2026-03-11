package com.goodsplatform.controller;

import com.goodsplatform.dto.request.InventoryItemCreateRequestDto;
import com.goodsplatform.dto.request.InventorySearchCondition;
import com.goodsplatform.dto.response.InventoryItemResponseDto;
import com.goodsplatform.entity.User;
import com.goodsplatform.repository.UserRepository;
import com.goodsplatform.service.InventoryItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryItemController {

        private final InventoryItemService inventoryItemService;
        private final UserRepository userRepository;

        @PostMapping
        public ResponseEntity<InventoryItemResponseDto> addMyItem(
                        @Valid @RequestBody InventoryItemCreateRequestDto request) {
                // TODO: 실제 Security 연동 시 @AuthenticationPrincipal 활용
                User mockUser = userRepository.findByUsername("testUser")
                                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                                                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.")));

                System.out.println("아이템 추가 요청 수신: itemId=" + request.getItemId() + ", userImageUrl="
                                + request.getUserImageUrl());
                InventoryItemResponseDto response = inventoryItemService.addInventoryItem(mockUser, request);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }

        @GetMapping
        public ResponseEntity<Page<InventoryItemResponseDto>> getMyItems(
                        @ModelAttribute InventorySearchCondition condition,
                        @PageableDefault(size = 20) Pageable pageable) {

                // TODO: 실제 Security 연동 시 @AuthenticationPrincipal 활용
                User mockUser = userRepository.findByUsername("testUser")
                                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                                                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.")));

                Page<InventoryItemResponseDto> pageData = inventoryItemService.getMyInventoryItems(mockUser, condition,
                                pageable);
                return ResponseEntity.ok(pageData);
        }

        @GetMapping("/collection-item/{collectionItemId}")
        public ResponseEntity<InventoryItemResponseDto> getInventoryItemByCollectionItemId(
                        @PathVariable("collectionItemId") Long collectionItemId) {

                // TODO: 실제 Security 연동 시 @AuthenticationPrincipal 활용
                User mockUser = userRepository.findByUsername("testUser")
                                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                                                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.")));

                InventoryItemResponseDto response = inventoryItemService.getInventoryItemByCollectionItemId(mockUser,
                                collectionItemId);
                if (response == null) {
                        return ResponseEntity.noContent().build();
                }
                return ResponseEntity.ok(response);
        }

        @PatchMapping("/{inventoryId}")
        public ResponseEntity<InventoryItemResponseDto> updateInventoryItemNoteAndPrice(
                        @PathVariable("inventoryId") Long inventoryId,
                        @Valid @RequestBody com.goodsplatform.dto.request.InventoryItemUpdateRequestDto request) {

                // TODO: 실제 Security 연동 시 @AuthenticationPrincipal 활용
                User mockUser = userRepository.findByUsername("testUser")
                                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                                                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.")));

                System.out.println("아이템 수정 요청 수신: inventoryId=" + inventoryId + ", userImageUrl="
                                + request.getUserImageUrl());
                InventoryItemResponseDto response = inventoryItemService.updateInventoryItemNoteAndPrice(mockUser,
                                inventoryId, request);
                return ResponseEntity.ok(response);
        }

        @org.springframework.web.bind.annotation.DeleteMapping("/{inventoryId}")
        public ResponseEntity<Void> deleteInventoryItem(
                        @PathVariable("inventoryId") Long inventoryId) {

                // TODO: 실제 Security 연동 시 @AuthenticationPrincipal 활용
                User mockUser = userRepository.findByUsername("testUser")
                                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                                                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.")));

                inventoryItemService.deleteInventoryItem(mockUser, inventoryId);
                return ResponseEntity.noContent().build();
        }
}
