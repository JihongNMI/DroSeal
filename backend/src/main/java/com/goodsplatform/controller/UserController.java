package com.goodsplatform.controller;

import com.goodsplatform.dto.request.UserCursorSkinUpdateRequestDto;
import com.goodsplatform.dto.response.UserResponseDto;
import com.goodsplatform.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// TODO: JWT 활성화 후 @AuthenticationPrincipal 로 교체 및 인증 적용
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMe() {
        // TODO: JWT 활성화 후 @AuthenticationPrincipal 로 교체
        return ResponseEntity.ok(userService.getMe("testUser"));
    }

    @PatchMapping("/me/cursor-skin")
    public ResponseEntity<UserResponseDto> updateCursorSkin(
            @Valid @RequestBody UserCursorSkinUpdateRequestDto request) {
        // TODO: JWT 활성화 후 @AuthenticationPrincipal 로 교체
        return ResponseEntity.ok(userService.updateCursorSkin("testUser", request.getCursorSkinId()));
    }
}
