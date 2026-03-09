package com.goodsplatform.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoodsAnalyzeRequest {

    /** 이미지 URL (JSON 요청 시 사용) */
    private String imageUrl;

    /** 업로드된 이미지 파일 (multipart 요청 시 사용) */
    @JsonIgnore
    private MultipartFile image;
}
