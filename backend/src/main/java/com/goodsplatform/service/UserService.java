package com.goodsplatform.service;

import com.goodsplatform.dto.response.UserResponseDto;
import com.goodsplatform.entity.CursorSkin;
import com.goodsplatform.entity.User;
import com.goodsplatform.repository.CursorSkinRepository;
import com.goodsplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final CursorSkinRepository cursorSkinRepository;

    public UserResponseDto getMe(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다: " + username));
        return UserResponseDto.from(user);
    }

    @Transactional
    public UserResponseDto updateCursorSkin(String username, Long cursorSkinId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다: " + username));

        CursorSkin cursorSkin = cursorSkinRepository.findById(cursorSkinId)
                .orElseThrow(() -> new IllegalArgumentException("커서 스킨을 찾을 수 없습니다: " + cursorSkinId));

        user.setCursorSkin(cursorSkin);
        return UserResponseDto.from(user);
    }
}
