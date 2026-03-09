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

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long>, InventoryItemRepositoryCustom {

    /**
     * 특정 유저가 소유한 인벤토리 아이템 페이징 조회
     */
    Page<InventoryItem> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * 단건 인벤토리 접근 권한 확인용 (아이템ID + 유저)
     */
    Optional<InventoryItem> findByInventoryIdAndUser(Long inventoryId, User user);

    /**
     * 특정 유저가 소유한 인벤토리 아이템 중 특정 도감(Collection)에 속하는 고유 아이템 종류(CollectionItem)의 개수 반환
     */
    @Query("SELECT COUNT(DISTINCT i.item.itemId) FROM InventoryItem i WHERE i.user.userId = :userId AND i.item.collection.collectionId = :collectionId")
    long countDistinctItemsByCollectionAndUser(@Param("collectionId") Long collectionId, @Param("userId") Long userId);

    /**
     * 특정 유저가 가진 특정 도감 아이템 정보 1건 조회
     */
    Optional<InventoryItem> findFirstByUser_UserIdAndItem_ItemId(Long userId, Long collectionItemId);
}
