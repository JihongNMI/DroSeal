package com.goodsplatform.dto.request;

import com.goodsplatform.entity.RegistrationType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class InventoryItemCreateRequestDto {

    /**
     * 도감 아이템 연결(공식 데이터 기반)
     * 완전 커스텀 등록일 경우 null 허용
     */
    private Long itemId;

    /**
     * 도감 컬렉션 연결 (선택사항)
     */
    private Long collectionId;

    /**
     * 카테고리 ID
     */
    private Long categoryId;

    /**
     * 미등록 굿즈일 경우 직접 작성하는 이름
     */
    private String customName;

    /**
     * 수량
     */
    @NotNull(message = "수량은 필수입니다.")
    private Integer quantity;

    @NotNull(message = "등록 타입(AUTO/MANUAL)은 필수입니다.")
    private RegistrationType regType;

    /**
     * AI 분석을 통한 등록인 경우 유사도 점수
     */
    private BigDecimal aiConfidence;

    /**
     * 실제 보관 장소 문자열
     */
    private String location;

    /**
     * 유저가 직접 업로드한 실물 사진 URL
     */
    @com.fasterxml.jackson.annotation.JsonProperty("userImageUrl")
    private String userImageUrl;

    /**
     * 사용자 메모
     */
    private String note;

    /**
     * 구매 가격
     */
    private BigDecimal purchasedPrice;

    /**
     * 구매 일자
     */
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime purchasedAt;
}
