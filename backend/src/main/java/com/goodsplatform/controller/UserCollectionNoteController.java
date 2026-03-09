package com.goodsplatform.controller;

import com.goodsplatform.dto.request.UserCollectionNoteRequestDto;
import com.goodsplatform.dto.response.UserCollectionNoteResponseDto;
import com.goodsplatform.entity.User;
import com.goodsplatform.repository.UserRepository;
import com.goodsplatform.service.UserCollectionNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/encyclopedia-note")
@RequiredArgsConstructor
public class UserCollectionNoteController {

    private final UserCollectionNoteService noteService;
    private final UserRepository userRepository;

    @GetMapping("/{collectionItemId}")
    public ResponseEntity<UserCollectionNoteResponseDto> getNote(
            @PathVariable("collectionItemId") Long collectionItemId) {

        // TODO: 실제 Security 연동 시 @AuthenticationPrincipal 활용
        User mockUser = userRepository.findByUsername("testUser")
                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.")));

        UserCollectionNoteResponseDto response = noteService.getNote(mockUser, collectionItemId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{collectionItemId}")
    public ResponseEntity<UserCollectionNoteResponseDto> saveOrUpdateNote(
            @PathVariable("collectionItemId") Long collectionItemId,
            @RequestBody UserCollectionNoteRequestDto request) {

        // TODO: 실제 Security 연동 시 @AuthenticationPrincipal 활용
        User mockUser = userRepository.findByUsername("testUser")
                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.")));

        UserCollectionNoteResponseDto response = noteService.saveOrUpdateNote(mockUser, collectionItemId, request);
        return ResponseEntity.ok(response);
    }
}
