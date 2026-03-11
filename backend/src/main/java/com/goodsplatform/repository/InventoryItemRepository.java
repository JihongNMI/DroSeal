package com.goodsplatform.repository;

import com.goodsplatform.entity.InventoryItem;
import com.goodsplatform.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long>, InventoryItemRepositoryCustom {

    /**
     * 특정 유저가 소유한 인벤토리 아이템 페이징 조회 (삭제되지 않은 것만)
     */
    Page<InventoryItem> findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * 단건 인벤토리 접근 권한 확인용 (아이템ID + 유저, 삭제되지 않은 것만)
     */
    Optional<InventoryItem> findByInventoryIdAndUserAndDeletedAtIsNull(Long inventoryId, User user);
    
    /**
     * 단건 인벤토리 접근 권한 확인용 (아이템ID + 유저) - 삭제 여부 무관
     */
    Optional<InventoryItem> findByInventoryIdAndUser(Long inventoryId, User user);

    /**
     * 특정 유저가 소유한 인벤토리 아이템 중 특정 도감(Collection)에 속하는 고유 아이템 종류(CollectionItem)의 개수 반환 (삭제되지 않은 것만)
     */
    @Query("SELECT COUNT(DISTINCT i.item.itemId) FROM InventoryItem i WHERE i.user.userId = :userId AND i.item.collection.collectionId = :collectionId AND i.deletedAt IS NULL")
    long countDistinctItemsByCollectionAndUser(@Param("collectionId") Long collectionId, @Param("userId") Long userId);

    /**
     * 특정 유저가 가진 특정 도감 아이템 정보 1건 조회 (삭제되지 않은 것만)
     */
    Optional<InventoryItem> findFirstByUser_UserIdAndItem_ItemIdAndDeletedAtIsNull(Long userId, Long collectionItemId);

    /**
     * 특정 유저가 특정 도감에서 보유한 CollectionItem ID 목록 일괄 조회 (N+1 방지, 삭제되지 않은 것만)
     */
    @Query("SELECT i.item.itemId FROM InventoryItem i WHERE i.user.userId = :userId AND i.item.collection.collectionId = :collectionId AND i.deletedAt IS NULL")
    Set<Long> findOwnedItemIdsByUserIdAndCollectionId(@Param("userId") Long userId, @Param("collectionId") Long collectionId);

    /**
     * 특정 도감 내에서 유저가 직접 업로드한 이미지가 있는 첫 번째 아이템 조회 (썸네일 fallback용, 삭제되지 않은 것만)
     */
    Optional<InventoryItem> findFirstByCollection_CollectionIdAndUserImageUrlIsNotNullAndDeletedAtIsNullOrderByInventoryIdAsc(Long collectionId);
}
