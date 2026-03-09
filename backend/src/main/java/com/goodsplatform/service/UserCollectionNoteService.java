package com.goodsplatform.service;

import com.goodsplatform.dto.request.UserCollectionNoteRequestDto;
import com.goodsplatform.dto.response.UserCollectionNoteResponseDto;
import com.goodsplatform.entity.CollectionItem;
import com.goodsplatform.entity.User;
import com.goodsplatform.entity.UserCollectionNote;
import com.goodsplatform.repository.CollectionItemRepository;
import com.goodsplatform.repository.UserCollectionNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserCollectionNoteService {

    private final UserCollectionNoteRepository noteRepository;
    private final CollectionItemRepository collectionItemRepository;

    public UserCollectionNoteResponseDto getNote(User user, Long collectionItemId) {
        return noteRepository.findByUser_UserIdAndCollectionItem_ItemId(user.getUserId(), collectionItemId)
                .map(UserCollectionNoteResponseDto::from)
                .orElse(null);
    }

    @Transactional
    public UserCollectionNoteResponseDto saveOrUpdateNote(User user, Long collectionItemId,
            UserCollectionNoteRequestDto request) {
        UserCollectionNote note = noteRepository
                .findByUser_UserIdAndCollectionItem_ItemId(user.getUserId(), collectionItemId)
                .orElseGet(() -> {
                    CollectionItem item = collectionItemRepository.findById(collectionItemId)
                            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 도감 아이템입니다."));
                    return UserCollectionNote.builder()
                            .user(user)
                            .collectionItem(item)
                            .build();
                });

        note.setDisplayNote(request.getDisplayNote());
        note.setAskingPrice(request.getAskingPrice());

        UserCollectionNote savedNote = noteRepository.save(note);
        return UserCollectionNoteResponseDto.from(savedNote);
    }
}
