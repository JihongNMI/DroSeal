package com.goodsplatform.dto.request;

import com.goodsplatform.entity.Rarity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CollectionItemCreateRequestDto {

    @NotNull(message = "컬렉션의 고유 식별자(ID)가 필요합니다.")
    private Long collectionId;

    @NotBlank(message = "아이템 이름은 필수입니다.")
    private String name;

    private Integer itemNumber;

    private Rarity rarity;

    private String imageUrl;

    private String description;

    // Vector DB 연동 시 할당될 고유 ID
    private String vectorId;

    private String imageHash;

    private Boolean isOfficial;
}
