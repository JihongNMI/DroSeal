package com.goodsplatform.dto.response;

import com.goodsplatform.entity.UserCollectionNote;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCollectionNoteResponseDto {
    private Long noteId;
    private Long collectionItemId;
    private String displayNote;
    private BigDecimal askingPrice;
    private LocalDateTime updatedAt;

    public static UserCollectionNoteResponseDto from(UserCollectionNote entity) {
        return UserCollectionNoteResponseDto.builder()
                .noteId(entity.getNoteId())
                .collectionItemId(entity.getCollectionItem().getItemId())
                .displayNote(entity.getDisplayNote())
                .askingPrice(entity.getAskingPrice())
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt() : entity.getCreatedAt())
                .build();
    }
}
