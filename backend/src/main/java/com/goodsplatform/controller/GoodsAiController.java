package com.goodsplatform.controller;

import com.goodsplatform.dto.GoodsAnalyzeRequest;
import com.goodsplatform.dto.response.CollectionItemResponseDto;
import com.goodsplatform.entity.User;
import com.goodsplatform.service.GoodsAiPipelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/goods")
@RequiredArgsConstructor
public class GoodsAiController {

    private final GoodsAiPipelineService goodsAiPipelineService;

    /**
     * Stage D: 이미지 URL을 받아 분석하여 저장하지 않고 List&lt;CollectionItemResponseDto&gt;만
     * 반환합니다.
     * Content-Type: application/json, body: { "imageUrl": "https://..." }
     */
    @PostMapping(value = "/analyze", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> analyzeByImageUrl(@RequestBody(required = false) GoodsAnalyzeRequest request) {
        if (request == null || !hasImageUrl(request)) {
            return ResponseEntity.badRequest()
                    .body(new ErrorBody("IMAGE_REQUIRED", "이미지 URL(imageUrl)이 필요합니다."));
        }
        return doAnalyze(request);
    }

    /**
     * Stage D: 이미지 파일을 받아 분석하여 저장하지 않고 List&lt;CollectionItemResponseDto&gt;만
     * 반환합니다.
     * Content-Type: multipart/form-data, part 이름: image
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyzeByImageFile(@RequestPart("image") MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ErrorBody("IMAGE_REQUIRED", "이미지 파일(image)이 필요합니다."));
        }
        GoodsAnalyzeRequest request = GoodsAnalyzeRequest.builder().image(image).build();
        return doAnalyze(request);
    }

    private ResponseEntity<?> doAnalyze(GoodsAnalyzeRequest request) {
        try {
            // TODO: 실제 인증 연동 시 시큐리티 컨텍스트에서 로그인 유저를 가져와야 합니다.
            User mockUser = User.builder().userId(1L).username("testUser").build();

            List<CollectionItemResponseDto> drafts = goodsAiPipelineService.analyzeAndPreview(request, mockUser);
            return ResponseEntity.ok(drafts);
        } catch (Exception e) {
            log.error("이미지 분석 실패", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorBody("ANALYZE_FAILED", "이미지 분석 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    private static boolean hasImageUrl(GoodsAnalyzeRequest r) {
        return r != null && r.getImageUrl() != null && !r.getImageUrl().isBlank();
    }

    private record ErrorBody(String code, String message) {
    }
}
