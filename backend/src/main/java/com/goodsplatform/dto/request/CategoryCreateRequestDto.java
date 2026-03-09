package com.goodsplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CategoryCreateRequestDto {

    @NotBlank(message = "카테고리 이름은 필수입니다.")
    private String name;

    private Long parentId;
}
