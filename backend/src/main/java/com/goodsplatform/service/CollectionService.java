package com.goodsplatform.service;

import com.goodsplatform.dto.request.CollectionCreateRequestDto;
import com.goodsplatform.dto.response.CollectionProgressResponseDto;
import com.goodsplatform.entity.InventoryCategory;
import com.goodsplatform.entity.Collection;
import com.goodsplatform.entity.User;
import com.goodsplatform.repository.InventoryCategoryRepository;
import com.goodsplatform.repository.CollectionItemRepository;
import com.goodsplatform.repository.CollectionRepository;
import com.goodsplatform.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryCategoryRepository InventoryCategoryRepository;

    /**
     * 새로운 도감(Collection) 생성
     */
    @Transactional
    public CollectionProgressResponseDto createCollection(User user, CollectionCreateRequestDto request) {
        InventoryCategory category = InventoryCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        Collection collection = Collection.builder()
                .name(request.getName())
                .description(request.getDescription())
                .categories(java.util.List.of(category))
                .isOfficial(request.getIsOfficial() != null ? request.getIsOfficial() : false)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .gridX(request.getGridX() != null ? request.getGridX() : 5)
                .gridY(request.getGridY() != null ? request.getGridY() : 12)
                .createdBy(user)
                .build();

        Collection savedCollection = collectionRepository.save(collection);

        // 방금 생성한 빈 도감이므로 구성 요소는 0, 가진 개수도 0
        return CollectionProgressResponseDto.from(savedCollection, 0, 0);
    }

    /**
     * 전체 도감 목록 페이징 및 검색 조회 (진척도 포함)
     */
    public Page<CollectionProgressResponseDto> getAllCollections(Long categoryId, String keyword, Pageable pageable,
            User user) {
        Page<Collection> collections;

        if (categoryId != null && keyword != null && !keyword.trim().isEmpty()) {
            collections = collectionRepository.findByCategories_CategoryIdAndNameContaining(categoryId, keyword,
                    pageable);
        } else if (categoryId != null) {
            collections = collectionRepository.findByCategories_CategoryId(categoryId, pageable);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            collections = collectionRepository.findByNameContaining(keyword, pageable);
        } else {
            collections = collectionRepository.findAll(pageable);
        }

        return collections.map(collection -> getCollectionProgress(collection, user));
    }

    /**
     * 도감 진척도 상세 조회
     */
    public CollectionProgressResponseDto getCollectionProgress(Collection collection, User user) {
        Long collectionId = collection.getCollectionId();

        // 1. 해당 도감에 속하는 전체 카드(CollectionItem) 개수 조회
        long totalItems = countItemsInCollection(collectionId);

        // 2. 해당 도감에 속한 카드 중 내가(User) 보유하고 있는 개수
        long collectedItems = countCollectedItems(collectionId, user.getUserId());

        return CollectionProgressResponseDto.from(collection, (int) totalItems, (int) collectedItems);
    }

    private long countItemsInCollection(Long collectionId) {
        return collectionItemRepository.countByCollection_CollectionId(collectionId);
    }

    private long countCollectedItems(Long collectionId, Long userId) {
        return inventoryItemRepository.countDistinctItemsByCollectionAndUser(collectionId, userId);
    }

    public Collection getCollectionById(Long collectionId) {
        return collectionRepository.findById(collectionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 도감입니다."));
    }
}
