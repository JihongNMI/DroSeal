package com.goodsplatform.repository;

import com.goodsplatform.entity.CollectionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CollectionItemRepository extends JpaRepository<CollectionItem, Long>, CollectionItemRepositoryCustom {

    /**
     * Vector DB 연동 시 매칭된 Vector ID로 마스터 엔티티 조회
     */
    Optional<CollectionItem> findByVectorId(String vectorId);

    /**
     * 공식 데이터(이름) 기반 중복 조회용 방어 쿼리
     */
    Optional<CollectionItem> findByNameIgnoreCase(String name);

    /**
     * 특정 도감에 속하는 컬렉션 아이템의 총 개수
     */
    long countByCollection_CollectionId(Long collectionId);

    /**
     * 이미지 해시로 기존 마스터 데이터 조회 (중복 방어 및 재활용)
     */
    Optional<CollectionItem> findFirstByImageHash(String imageHash);
}
