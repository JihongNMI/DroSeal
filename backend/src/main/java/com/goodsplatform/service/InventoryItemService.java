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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final InventoryCategoryRepository inventoryCategoryRepository;

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

        // 3. 카테고리 검증
        com.goodsplatform.entity.InventoryCategory category = null;
        if (request.getCategoryId() != null) {
            category = inventoryCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다: " + request.getCategoryId()));
        }

        // 4. 인벤토리 아이템 생성 (regType에 따른 분기 로직은 향후 AI 연동 고도화 시 추가)
        InventoryItem inventoryItem = InventoryItem.builder()
                .user(user)
                .item(masterItem)
                .category(category)
                .customName(request.getCustomName())
                .regType(request.getRegType())
                .aiConfidence(request.getAiConfidence())
                .location(request.getLocation())
                .userImageUrl(request.getUserImageUrl())
                .note(request.getNote())
                .purchasedPrice(request.getPurchasedPrice())
                .purchasedAt(request.getPurchasedAt())
                .build();

        InventoryItem savedItem = inventoryItemRepository.save(inventoryItem);

        // 5. 응답 DTO 변환 반환
        return InventoryItemResponseDto.from(savedItem);
    }

    /**
     * 도감 아이템(CollectionItem)에 연결된 내 인벤토리 아이템 1개 찾기
     */
    public InventoryItemResponseDto getInventoryItemByCollectionItemId(User user, Long collectionItemId) {
        return inventoryItemRepository.findFirstByUser_UserIdAndItem_ItemId(user.getUserId(), collectionItemId)
                .map(InventoryItemResponseDto::from)
                .orElse(null); // 없으면 null 반환 (프론트에서 처리)
    }

    @Transactional
    public InventoryItemResponseDto updateInventoryItemNoteAndPrice(User user, Long inventoryId,
            com.goodsplatform.dto.request.InventoryItemUpdateRequestDto request) {
        InventoryItem inventoryItem = inventoryItemRepository.findByInventoryIdAndUser(inventoryId, user)
                .orElseThrow(() -> new IllegalArgumentException("접근 권한이 없거나 존재하지 않는 아이템입니다."));

        // 카테고리 업데이트
        if (request.getCategoryId() != null) {
            com.goodsplatform.entity.InventoryCategory category = inventoryCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다: " + request.getCategoryId()));
            inventoryItem.setCategory(category);
        }

        // 노트 및 가격 업데이트
        if (request.getNote() != null) {
            inventoryItem.setNote(request.getNote());
        }
        if (request.getPurchasedPrice() != null) {
            inventoryItem.setPurchasedPrice(request.getPurchasedPrice());
        }

        // @UpdateTimestamp가 있으므로 save 시 자동 갱신됨
        return InventoryItemResponseDto.from(inventoryItem);
    }

    /**
     * 인벤토리 아이템 삭제
     */
    @Transactional
    public void deleteInventoryItem(User user, Long inventoryId) {
        InventoryItem inventoryItem = inventoryItemRepository.findByInventoryIdAndUser(inventoryId, user)
                .orElseThrow(() -> new IllegalArgumentException("접근 권한이 없거나 존재하지 않는 아이템입니다."));
        inventoryItemRepository.delete(inventoryItem);
    }
}
