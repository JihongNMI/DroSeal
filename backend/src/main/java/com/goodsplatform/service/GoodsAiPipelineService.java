package com.goodsplatform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goodsplatform.entity.AiAnalysisLog;
import com.goodsplatform.entity.AnalysisStatus;
import com.goodsplatform.entity.CollectionItem;
import com.goodsplatform.entity.User;
import com.goodsplatform.repository.AiAnalysisLogRepository;
import com.goodsplatform.dto.GoodsAnalyzeRequest;
import com.goodsplatform.dto.response.CollectionItemResponseDto;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import com.goodsplatform.repository.CollectionItemRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class GoodsAiPipelineService {

    // 타임아웃 명시적 설정
    private static final Duration AI_ANALYSIS_TIMEOUT = Duration.ofSeconds(15);
    private static final Duration IMAGE_DOWNLOAD_TIMEOUT = Duration.ofSeconds(5);

    private static final String DEFAULT_EXTRA_DETAILS = "{}";

    private final AiAnalysisLogRepository aiAnalysisLogRepository;
    private final ObjectMapper objectMapper;
    private final WebClient geminiWebClient;
    private final VectorSearchService vectorSearchService;
    private final CollectionItemRepository collectionItemRepository;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public GoodsAiPipelineService(
            AiAnalysisLogRepository aiAnalysisLogRepository,
            ObjectMapper objectMapper,
            @Qualifier("geminiWebClient") WebClient geminiWebClient,
            VectorSearchService vectorSearchService,
            CollectionItemRepository collectionItemRepository) {
        this.aiAnalysisLogRepository = aiAnalysisLogRepository;
        this.objectMapper = objectMapper;
        this.geminiWebClient = geminiWebClient;
        this.vectorSearchService = vectorSearchService;
        this.collectionItemRepository = collectionItemRepository;
    }

    /**
     * [Hash -> A -> B -> C -> D] 흐름: 해시 중복 방어 후 분석 결과 획득
     */
    @Transactional
    public List<CollectionItemResponseDto> analyzeAndPreview(GoodsAnalyzeRequest request, User mockUser) {
        try {
            // 1. 이미지 바이트 추출 및 고유 해시(MD5) 생성
            ImagePayload payload = resolveImage(request);
            if (payload == null) {
                log.warn("이미지 데이터를 해석할 수 없습니다.");
                return List.of(createDefaultDraft(null));
            }

            // 2. [Stage Hash] 해시 기반 중복 방어
            Optional<CollectionItem> hashMatch = collectionItemRepository.findFirstByImageHash(payload.imageHash());
            if (hashMatch.isPresent()) {
                log.info("Stage Hash 매칭 성공: 기존 저장된 데이터를 재활용합니다. Hash: {}", payload.imageHash());
                return List.of(CollectionItemResponseDto.from(hashMatch.get()));
            }

            // 3. [Stage A] 초고속 매칭 (Vector DB - 옵션)
            Optional<CollectionItem> existingMatch = vectorSearchService.findExistingGoods(request);
            if (existingMatch.isPresent()) {
                log.info("Stage A 매칭 성공: 기존 데이터를 반환합니다.");
                return List.of(CollectionItemResponseDto.from(existingMatch.get()));
            }

            // 4. [Stage B & C] FastAPI로 이미지 분석 요청 전달 (YOLO -> CLIP -> Gemini 파이프라인)
            String refinedJson = callFastApiForAnalysis(payload);

            // 분석 원본(로그) 기록
            AiAnalysisLog logEntity = AiAnalysisLog.builder()
                    .user(mockUser)
                    .status(AnalysisStatus.COMPLETED)
                    .rawImageUrl(request.getImageUrl() != null ? request.getImageUrl() : "MULTIPART_UPLOAD")
                    .geminiRawJson(refinedJson)
                    .build();
            aiAnalysisLogRepository.save(logEntity);

            // 5. [Stage D 준비] JSON을 DTO 리스트로 변환 (해시 포함시켜서 반환)
            return parseJsonToDrafts(refinedJson, payload.imageHash());

        } catch (Exception e) {
            log.error("분석 파이프라인 에러: {}", e.getMessage());
            return List.of(createDefaultDraft(null));
        }
    }

    private String callFastApiForAnalysis(ImagePayload imagePayload) {
        String fastApiUrl = "http://localhost:8000/api/analyze"; // TODO: application.yml 등으로 외부 주입

        try {
            log.info("FastAPI 서버 ({}) 로 이미지 분석 요청 전송", fastApiUrl);

            // FastAPI 연동 규격에 맞게 JSON 바디 구성 (Base64 파일, MIME 타입 전달)
            Map<String, Object> requestBody = Map.of(
                    "image_base64", imagePayload.base64Data(),
                    "mime_type", imagePayload.mimeType(),
                    "image_hash", imagePayload.imageHash());

            @SuppressWarnings("unchecked")
            Map<String, Object> response = geminiWebClient.mutate()
                    .baseUrl(fastApiUrl)
                    .build()
                    .post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(AI_ANALYSIS_TIMEOUT);

            if (response == null) {
                throw new IllegalStateException("FastAPI 응답이 비어 있습니다.");
            }

            // FastAPI가 반환하는 결과 양식 (items 배열 포함)을 문자열로 직렬화하여 반환
            return objectMapper.writeValueAsString(response);

        } catch (WebClientResponseException e) {
            log.error("FastAPI 통신 실패 - Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return buildDefaultItemsJson();
        } catch (Exception e) {
            log.error("FastAPI 호출 중 알 수 없는 오류 발생: {}", e.getMessage());
            return buildDefaultItemsJson();
        }
    }

    /**
     * Gemini 응답 JSON을 파싱하여 드래프트 DTO 리스트로 변환 (id 없음)
     */
    private List<CollectionItemResponseDto> parseJsonToDrafts(String refinedJson, String imageHash) {
        if (isBlank(refinedJson)) {
            return List.of(createDefaultDraft(imageHash));
        }
        try {
            Map<String, Object> root = objectMapper.readValue(refinedJson, new TypeReference<>() {
            });
            Object itemsObj = root.get("items");
            if (itemsObj instanceof List<?> items && !items.isEmpty()) {
                List<CollectionItemResponseDto> drafts = new ArrayList<>();
                for (Object item : items) {
                    if (item instanceof Map<?, ?> map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> m = (Map<String, Object>) map;
                        drafts.add(mapToDraft(m, imageHash));
                    }
                }
                return drafts.isEmpty() ? List.of(createDefaultDraft(imageHash)) : drafts;
            }
        } catch (Exception e) {
            log.warn("JSON 파싱 실패, 기본 드래프트 반환: {}", e.getMessage());
        }
        return List.of(createDefaultDraft(imageHash));
    }

    private CollectionItemResponseDto mapToDraft(Map<String, Object> m, String imageHash) {
        String series = stringOrEmpty(m.get("series"));
        String characterName = stringOrEmpty(m.get("characterName"));
        String category = stringOrEmpty(m.get("category"));
        Object extraObj = m.get("extraDetails");
        String extraDetails;
        if (extraObj instanceof String s) {
            extraDetails = s;
        } else if (extraObj != null) {
            try {
                extraDetails = objectMapper.writeValueAsString(extraObj);
            } catch (Exception e) {
                extraDetails = DEFAULT_EXTRA_DETAILS;
            }
        } else {
            extraDetails = DEFAULT_EXTRA_DETAILS;
        }
        if (series.isBlank())
            series = "미상";
        if (characterName.isBlank())
            characterName = "미상";
        if (category.isBlank())
            category = "기타";
        if (extraDetails.isBlank())
            extraDetails = DEFAULT_EXTRA_DETAILS;

        // 추후 프론트엔드가 요구하는 형식에 맞추어 description 속성으로 통합
        String aggregatedDescription = String.format("Series: %s / Character: %s / Category: %s / Extra: %s",
                series, characterName, category, extraDetails);

        return CollectionItemResponseDto.builder()
                .itemId(null)
                .name(series + " - " + characterName)
                .description(aggregatedDescription)
                .imageHash(imageHash)
                .isOfficial(true)
                .build();
    }

    private static String stringOrEmpty(Object o) {
        return o == null ? "" : o.toString().trim();
    }

    private static CollectionItemResponseDto createDefaultDraft(String imageHash) {
        return CollectionItemResponseDto.builder()
                .itemId(null)
                .name("미상 - 미상")
                .description(DEFAULT_EXTRA_DETAILS)
                .imageHash(imageHash)
                .isOfficial(true)
                .build();
    }

    private String buildDefaultItemsJson() {
        return "{\"items\":[{\"series\":\"미상\",\"characterName\":\"미상\",\"category\":\"기타\",\"extraDetails\":\"{}\"}]}";
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    /**
     * 요청에서 이미지 URL 또는 MultipartFile을 해석해 base64 + mimeType + Hash 반환.
     */
    private ImagePayload resolveImage(GoodsAnalyzeRequest request) throws Exception {
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            byte[] bytes = request.getImage().getBytes();
            String contentType = Optional.ofNullable(request.getImage().getContentType())
                    .orElse(MediaType.IMAGE_JPEG_VALUE);
            if (!contentType.startsWith("image/"))
                contentType = MediaType.IMAGE_JPEG_VALUE;
            String imageHash = DigestUtils.md5DigestAsHex(bytes);
            return new ImagePayload(Base64.getEncoder().encodeToString(bytes), contentType, imageHash);
        }

        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            // 🚀 최적화: 기존 WebClient 빈을 mutate()로 재사용하고 타임아웃(5초) 적용
            try {
                byte[] bytes = geminiWebClient.mutate()
                        .baseUrl(request.getImageUrl())
                        .build()
                        .get()
                        .retrieve()
                        .bodyToMono(byte[].class)
                        .block(IMAGE_DOWNLOAD_TIMEOUT);

                if (bytes == null || bytes.length == 0)
                    return null;
                String imageHash = DigestUtils.md5DigestAsHex(bytes);
                return new ImagePayload(Base64.getEncoder().encodeToString(bytes), MediaType.IMAGE_JPEG_VALUE,
                        imageHash);
            } catch (Exception e) {
                log.error("외부 이미지 다운로드 실패 (URL: {}): {}", request.getImageUrl(), e.getMessage());
                return null;
            }
        }
        return null;
    }

    private record ImagePayload(String base64Data, String mimeType, String imageHash) {
    }
}