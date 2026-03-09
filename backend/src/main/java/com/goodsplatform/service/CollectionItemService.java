package com.goodsplatform.service;

import com.goodsplatform.dto.request.CollectionItemCreateRequestDto;
import com.goodsplatform.dto.response.CollectionItemResponseDto;
import com.goodsplatform.entity.Collection;
import com.goodsplatform.entity.CollectionItem;
import com.goodsplatform.repository.CollectionItemRepository;
import com.goodsplatform.repository.CollectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionItemService {

        private final CollectionItemRepository collectionItemRepository;
        private final CollectionRepository collectionRepository;

        /**
         * 기본 도감(공식 데이터) 등록 로직
         */
        @Transactional
        public CollectionItemResponseDto createMasterItem(CollectionItemCreateRequestDto request) {

                // 1. 이름 중복 방어
                collectionItemRepository.findByNameIgnoreCase(request.getName()).ifPresent(item -> {
                        throw new IllegalArgumentException("이미 존재하는 아이템 이름입니다: " + request.getName());
                });

                // 2. 소속된 Collection 그룹 확보
                Collection collection = collectionRepository.findById(request.getCollectionId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "존재하지 않는 컬렉션 그룹입니다 ID: " + request.getCollectionId()));

                // 3. Vector DB 1:1 매칭 식별자(임시 모의 발급, 추후 FastAPI 연결 시 처리)
                String vectorId = request.getVectorId() != null ? request.getVectorId()
                                : java.util.UUID.randomUUID().toString();

                // 4. 엔티티 빌드 및 저장
                CollectionItem collectionItem = CollectionItem.builder()
                                .collection(collection)
                                .itemNumber(request.getItemNumber())
                                .name(request.getName())
                                .rarity(request.getRarity())
                                .imageUrl(request.getImageUrl())
                                .description(request.getDescription())
                                .vectorId(vectorId)
                                .imageHash(request.getImageHash())
                                .isOfficial(request.getIsOfficial() != null ? request.getIsOfficial() : false)
                                .build();

                CollectionItem savedItem = collectionItemRepository.save(collectionItem);

                // 5. 응답 객체 반환
                return CollectionItemResponseDto.from(savedItem);
        }

        /**
         * 카테고리 계층 + 키워드 하이브리드 검색
         */
        public org.springframework.data.domain.Page<CollectionItemResponseDto> searchHybridItems(
                        com.goodsplatform.dto.request.ItemSearchCondition condition,
                        org.springframework.data.domain.Pageable pageable) {

                org.springframework.data.domain.Page<CollectionItem> pageResult = collectionItemRepository
                                .searchHybrid(condition, pageable);

                return pageResult.map(CollectionItemResponseDto::from);
        }

        @Transactional
        public CollectionItemResponseDto updateCollectionItemImage(Long itemId, String imageUrl) {
                CollectionItem item = collectionItemRepository.findById(itemId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 도감 아이템입니다."));

                item.setImageUrl(imageUrl);
                CollectionItem updatedItem = collectionItemRepository.save(item);

                return CollectionItemResponseDto.from(updatedItem);
        }
}
