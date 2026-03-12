package com.goodsplatform.service;

import com.goodsplatform.dto.response.CursorSkinResponseDto;
import com.goodsplatform.repository.CursorSkinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CursorSkinService {

    private final CursorSkinRepository cursorSkinRepository;

    public List<CursorSkinResponseDto> getActiveCursorSkins() {
        return cursorSkinRepository.findByIsActiveTrue()
                .stream()
                .map(CursorSkinResponseDto::from)
                .collect(Collectors.toList());
    }
}
