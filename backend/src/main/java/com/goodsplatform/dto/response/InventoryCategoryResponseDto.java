package com.goodsplatform.dto.response;

import com.goodsplatform.entity.InventoryCategory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class InventoryCategoryResponseDto {
    private Long categoryId;
    private Long parentId;
    private String name;
    private String path;
    private Integer level;
    private LocalDateTime createdAt;

    @Builder.Default
    private List<InventoryCategoryResponseDto> children = new ArrayList<>();

    public static InventoryCategoryResponseDto from(InventoryCategory category) {
        return InventoryCategoryResponseDto.builder()
                .categoryId(category.getCategoryId())
                .parentId(category.getParent() != null ? category.getParent().getCategoryId() : null)
                .name(category.getName())
                .path(category.getPath())
                .level(category.getLevel())
                .createdAt(category.getCreatedAt())
                .children(category.getChildren() != null ? category.getChildren().stream()
                        .map(InventoryCategoryResponseDto::from)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }
}
