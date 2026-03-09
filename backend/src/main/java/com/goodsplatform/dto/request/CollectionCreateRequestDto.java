package com.goodsplatform.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CollectionCreateRequestDto {

    @NotBlank(message = "도감 이름은 필수입니다.")
    private String name;

    private String description;

    @NotNull(message = "카테고리 ID는 필수입니다.")
    private Long categoryId;

    // 공식/인증 도감 여부 (관리자 생성일 경우 등)
    private Boolean isOfficial;

    // 커스텀 도감 공개 여부
    private Boolean isPublic;

    @Min(value = 1, message = "가로 그리드 크기는 1 이상이어야 합니다.")
    private Integer gridX;

    @Min(value = 1, message = "세로 그리드 크기는 1 이상이어야 합니다.")
    private Integer gridY;
}
