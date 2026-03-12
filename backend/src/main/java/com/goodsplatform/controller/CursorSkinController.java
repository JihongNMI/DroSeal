package com.goodsplatform.controller;

import com.goodsplatform.dto.response.CursorSkinResponseDto;
import com.goodsplatform.service.CursorSkinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// TODO: JWT 활성화 후 인증 적용 여부 검토
@RestController
@RequestMapping("/api/v1/cursor-skins")
@RequiredArgsConstructor
public class CursorSkinController {

    private final CursorSkinService cursorSkinService;

    @GetMapping
    public ResponseEntity<List<CursorSkinResponseDto>> getActiveCursorSkins() {
        return ResponseEntity.ok(cursorSkinService.getActiveCursorSkins());
    }
}
