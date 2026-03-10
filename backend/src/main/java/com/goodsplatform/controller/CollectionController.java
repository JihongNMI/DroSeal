package com.goodsplatform.controller;

import com.goodsplatform.dto.request.CollectionCreateRequestDto;
import com.goodsplatform.dto.response.CollectionProgressResponseDto;
import com.goodsplatform.entity.User;
import com.goodsplatform.repository.UserRepository;
import com.goodsplatform.service.CollectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;
    private final UserRepository userRepository;

    // TODO: Spring Security 적용 후 (@AuthenticationPrincipal User user) 로 변경해야 함
    private User getCurrentMockUser() {
        return userRepository.findByUsername("testUser")
                .orElseGet(() -> userRepository.findById(1L)
                        .orElseThrow(() -> new RuntimeException("테스트용 유저를 찾을 수 없습니다.")));
    }

    @PostMapping
    public ResponseEntity<CollectionProgressResponseDto> createCollection(
            @Valid @RequestBody CollectionCreateRequestDto request) {
        User user = getCurrentMockUser();
        CollectionProgressResponseDto response = collectionService.createCollection(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<CollectionProgressResponseDto> getCollectionProgress(@PathVariable("id") Long id) {
        User user = getCurrentMockUser();
        com.goodsplatform.entity.Collection collection = collectionService.getCollectionById(id);
        CollectionProgressResponseDto response = collectionService.getCollectionProgress(collection, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<CollectionProgressResponseDto>> getAllCollections(
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "keyword", required = false) String keyword,
            Pageable pageable) {
        User user = getCurrentMockUser();
        Page<CollectionProgressResponseDto> response = collectionService.getAllCollections(categoryId, keyword,
                pageable, user);
        return ResponseEntity.ok(response);
    }
}
