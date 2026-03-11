package com.goodsplatform.service;

import com.goodsplatform.dto.request.InventoryItemCreateRequestDto;
import com.goodsplatform.dto.request.InventorySearchCondition;
import com.goodsplatform.dto.response.InventoryItemResponseDto;
import com.goodsplatform.entity.CollectionItem;
import com.goodsplatform.entity.InventoryItem;
import com.goodsplatform.entity.User;
import com.goodsplatform.repository.CollectionItemRepository;
import com.goodsplatform.repository.InventoryItemRepository;
import com.goodsplatform.repository.InventoryCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@lombok.extern.slf4j.Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final InventoryCategoryRepository inventoryCategoryRepository;
    private final com.goodsplatform.repository.CollectionRepository collectionRepository;

    /**
     * 유저의 인벤토리 목록 페이징 조회
     */
    public Page<InventoryItemResponseDto> getMyInventoryItems(User user, InventorySearchCondition condition,
            Pageable pageable) {
        return inventoryItemRepository.searchInventory(user, condition, pageable)
                .map(InventoryItemResponseDto::from);
    }

    /**
     * 새로운 굿즈(콜렉션) 소유 등록
     * (AI 분석을 통한 AUTO 등록이거나, 순수 수동 MANUAL 등록 모두 처리)
     */
    @Transactional
    public InventoryItemResponseDto addInventoryItem(User user, InventoryItemCreateRequestDto request) {

        // 1. 도감 번호(itemId)가 들어왔다면 올바른 데이터인지 검증
        CollectionItem masterItem = null;
        if (request.getItemId() != null) {
            masterItem = collectionItemRepository.findById(request.getItemId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 굿즈 도감 번호입니다: " + request.getItemId()));
        }

        // 2. 입력 검증: 도감 아이템도 지정 안 하고, 수동 이름도 없으면 에러
        if (masterItem == null && (request.getCustomName() == null || request.getCustomName().isBlank())) {
            throw new IllegalArgumentException("도감 아이템을 선택하거나, 직접 이름을 입력해야 합니다.");
        }

        // 3. 컬렉션 검증
        com.goodsplatform.entity.Collection collection = null;
        if (request.getCollectionId() != null) {
            collection = collectionRepository.findById(request.getCollectionId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 컬렉션입니다: " + request.getCollectionId()));
        }

        // 4. 카테고리 검증
        com.goodsplatform.entity.InventoryCategory category = null;
        if (request.getCategoryId() != null) {
            category = inventoryCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다: " + request.getCategoryId()));
        }

        // 5. 수량 설정 (0 허용)
        Integer quantity = request.getQuantity() != null ? request.getQuantity() : 1;

        log.info("인벤토리 아이템 생성: user={}, itemId={}, imageUrl={}", user.getUsername(), request.getItemId(),
                request.getUserImageUrl());
        InventoryItem inventoryItem = InventoryItem.builder()
                .user(user)
                .item(masterItem)
                .collection(collection)
                .category(category)
                .customName(request.getCustomName())
                .quantity(quantity)
                .regType(request.getRegType())
                .aiConfidence(request.getAiConfidence())
                .location(request.getLocation())
                .userImageUrl(request.getUserImageUrl())
                .note(request.getNote())
                .purchasedPrice(request.getPurchasedPrice())
                .purchasedAt(request.getPurchasedAt())
                .build();

        InventoryItem savedItem = inventoryItemRepository.save(inventoryItem);

        // 7. 응답 DTO 변환 반환
        return InventoryItemResponseDto.from(savedItem);
    }

    /**
     * 도감 아이템(CollectionItem)에 연결된 내 인벤토리 아이템 1개 찾기 (삭제되지 않은 것만)
     */
    public InventoryItemResponseDto getInventoryItemByCollectionItemId(User user, Long collectionItemId) {
        return inventoryItemRepository.findFirstByUser_UserIdAndItem_ItemIdAndDeletedAtIsNull(user.getUserId(), collectionItemId)
                .map(InventoryItemResponseDto::from)
                .orElse(null); // 없으면 null 반환 (프론트에서 처리)
    }

    @Transactional
    public InventoryItemResponseDto updateInventoryItemNoteAndPrice(User user, Long inventoryId,
            com.goodsplatform.dto.request.InventoryItemUpdateRequestDto request) {
        InventoryItem inventoryItem = inventoryItemRepository.findByInventoryIdAndUser(inventoryId, user)
                .orElseThrow(() -> {
                    log.error("인벤토리 아이템 수정 권한 없음 또는 존재하지 않음: inventoryId={}, userId={}", inventoryId, user.getUserId());
                    return new IllegalArgumentException("해당 아이템에 대한 수정 권한이 없거나 아이템이 존재하지 않습니다.");
                });

        // 컬렉션 업데이트
        if (request.getCollectionId() != null) {
            com.goodsplatform.entity.Collection collection = collectionRepository.findById(request.getCollectionId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 컬렉션입니다: " + request.getCollectionId()));
            inventoryItem.setCollection(collection);
        }

        // 카테고리 업데이트
        if (request.getCategoryId() != null) {
            com.goodsplatform.entity.InventoryCategory category = inventoryCategoryRepository
                    .findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다: " + request.getCategoryId()));
            inventoryItem.setCategory(category);
        }

        // 이름 업데이트
        if (request.getCustomName() != null) {
            inventoryItem.setCustomName(request.getCustomName());
        }

        // 수량 업데이트
        if (request.getQuantity() != null) {
            inventoryItem.setQuantity(request.getQuantity());
        }

        // 위치 업데이트
        if (request.getLocation() != null) {
            inventoryItem.setLocation(request.getLocation());
        }

        // 이미지 URL 업데이트
        if (request.getUserImageUrl() != null) {
            log.info("인벤토리 아이템 이미지 업데이트 시도: inventoryId={}, imageUrl={}", inventoryId, request.getUserImageUrl());
            inventoryItem.setUserImageUrl(request.getUserImageUrl());
        }

        // 노트 업데이트
        if (request.getNote() != null) {
            inventoryItem.setNote(request.getNote());
        }

        // 가격 업데이트
        if (request.getPurchasedPrice() != null) {
            inventoryItem.setPurchasedPrice(request.getPurchasedPrice());
        }

        // 구매 일자 업데이트
        if (request.getPurchasedAt() != null) {
            inventoryItem.setPurchasedAt(request.getPurchasedAt());
        }

        // 명시적 저장 호출 (Dirty Checking 보조 및 즉각적인 반영 확인용)
        InventoryItem savedItem = inventoryItemRepository.save(inventoryItem);
        return InventoryItemResponseDto.from(savedItem);
    }

    /**
     * 인벤토리 아이템 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteInventoryItem(User user, Long inventoryId) {
        InventoryItem inventoryItem = inventoryItemRepository.findByInventoryIdAndUser(inventoryId, user)
                .orElseThrow(() -> new IllegalArgumentException("접근 권한이 없거나 존재하지 않는 아이템입니다."));
        
        // Soft delete: deletedAt 필드에 현재 시간 설정
        inventoryItem.setDeletedAt(java.time.LocalDateTime.now());
        inventoryItemRepository.save(inventoryItem);
        
        log.info("인벤토리 아이템 소프트 삭제: inventoryId={}, userId={}", inventoryId, user.getUserId());
    }
}
