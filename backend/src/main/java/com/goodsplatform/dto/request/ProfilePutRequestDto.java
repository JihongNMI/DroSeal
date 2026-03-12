package com.goodsplatform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfilePutRequestDto {
    private String email;
    private String nickname;
    private String password;
}
