package com.goodsplatform.repository;

import com.goodsplatform.entity.UserCollectionNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserCollectionNoteRepository extends JpaRepository<UserCollectionNote, Long> {
    Optional<UserCollectionNote> findByUser_UserIdAndCollectionItem_ItemId(Long userId, Long collectionItemId);
}
