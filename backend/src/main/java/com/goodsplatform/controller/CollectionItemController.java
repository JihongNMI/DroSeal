package com.goodsplatform.controller;

import com.goodsplatform.dto.request.CollectionItemCreateRequestDto;
import com.goodsplatform.dto.request.ItemSearchCondition;
import com.goodsplatform.dto.response.CollectionItemResponseDto;
import com.goodsplatform.service.CollectionItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/collection-items")
@RequiredArgsConstructor
public class CollectionItemController {

    private final CollectionItemService collectionItemService;

    @PostMapping
    public ResponseEntity<CollectionItemResponseDto> createMasterItem(
            @Valid @RequestBody CollectionItemCreateRequestDto request) {
        CollectionItemResponseDto response = collectionItemService.createMasterItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 도감 하이브리드 검색 (카테고리 + 키워드)
     */
    @GetMapping("/search")
    public ResponseEntity<Page<CollectionItemResponseDto>> searchHybrid(
            @ModelAttribute ItemSearchCondition condition,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(collectionItemService.searchHybridItems(condition, pageable));
    }

    @PatchMapping("/{itemId}")
    public ResponseEntity<CollectionItemResponseDto> updateCollectionItemImage(
            @PathVariable("itemId") Long itemId,
            @RequestBody Map<String, String> request) {

        String imageUrl = request.get("imageUrl");
        CollectionItemResponseDto response = collectionItemService.updateCollectionItemImage(itemId, imageUrl);
        return ResponseEntity.ok(response);
    }
}
