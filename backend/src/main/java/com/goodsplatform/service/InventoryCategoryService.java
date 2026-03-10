package com.goodsplatform.service;

import com.goodsplatform.dto.request.InventoryCategoryCreateRequestDto;
import com.goodsplatform.dto.request.InventoryCategoryUpdateRequestDto;
import com.goodsplatform.dto.response.InventoryCategoryResponseDto;
import com.goodsplatform.entity.InventoryCategory;
import com.goodsplatform.repository.InventoryCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryCategoryService {

    private final InventoryCategoryRepository inventoryCategoryRepository;

    /**
     * 카테고리 생성 로직
     * 부모 존재 여부에 따라 계층 구조(path)를 세팅합니다.
     */
    @Transactional
    public InventoryCategoryResponseDto createCategory(InventoryCategoryCreateRequestDto request) {
        InventoryCategory parent = null;
        Integer newLevel = 1;

        if (request.getParentId() != null) {
            parent = inventoryCategoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부모 카테고리입니다: " + request.getParentId()));
            newLevel = parent.getLevel() + 1;

            if (inventoryCategoryRepository.existsByNameAndParent(request.getName(), parent)) {
                throw new IllegalArgumentException("해당 부모 카테고리 내에 이미 같은 이름의 카테고리가 존재합니다: " + request.getName());
            }
        } else {
            if (inventoryCategoryRepository.existsByNameAndParentIsNull(request.getName())) {
                throw new IllegalArgumentException("최상위 계층에 이미 같은 이름의 카테고리가 존재합니다: " + request.getName());
            }
        }

        // 1. 카테고리 엔티티 생성 및 기본 저장 (ID 발급용)
        InventoryCategory category = InventoryCategory.builder()
                .name(request.getName())
                .parent(parent)
                .level(newLevel)
                .path("") // 임시
                .build();

        inventoryCategoryRepository.save(category);

        // 2. 발급된 ID를 기반으로 path 설정
        String newPath = (parent != null) ? parent.getPath() + "/" + category.getCategoryId()
                : String.valueOf(category.getCategoryId());

        category.setPath(newPath);
        // 트랜잭션 종료 시 더티 체킹으로 path 업데이트 발생

        return InventoryCategoryResponseDto.from(category);
    }

    /**
     * 전체 트리 구조 조회
     */
    public List<InventoryCategoryResponseDto> getCategoryTree() {
        // 루트 요소만 가져오면 Entity에 선언된 cascade 설정과 DTO의 재귀적 파싱으로 트리가 완성됨
        List<InventoryCategory> rootCategories = inventoryCategoryRepository.findByParentIsNull();
        return rootCategories.stream()
                .map(InventoryCategoryResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 부모 하위의 자식만 조회
     */
    public List<InventoryCategoryResponseDto> getChildren(Long parentId) {
        List<InventoryCategory> children = inventoryCategoryRepository.findByParent_CategoryId(parentId);
        return children.stream()
                .map(InventoryCategoryResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 카테고리 수정
     */
    @Transactional
    public InventoryCategoryResponseDto updateCategory(Long categoryId, InventoryCategoryUpdateRequestDto request) {
        InventoryCategory category = inventoryCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        // 순환 참조 방지: 자기 자신을 부모로 설정하려는 경우
        if (request.getParentId() != null && request.getParentId().equals(categoryId)) {
            throw new IllegalArgumentException("카테고리는 자기 자신을 부모로 가질 수 없습니다.");
        }

        // 부모 변경 처리
        InventoryCategory newParent = null;
        if (request.getParentId() != null) {
            newParent = inventoryCategoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부모 카테고리입니다: " + request.getParentId()));

            // 순환 참조 방지: 자신의 자손을 부모로 설정하려는 경우
            if (isDescendant(category, newParent)) {
                throw new IllegalArgumentException("카테고리는 자신의 하위 카테고리를 부모로 가질 수 없습니다.");
            }
        }

        // 이름 업데이트
        category.setName(request.getName());

        // 부모 업데이트 및 레벨/경로 재계산
        category.setParent(newParent);
        Integer newLevel = (newParent != null) ? newParent.getLevel() + 1 : 1;
        category.setLevel(newLevel);

        String newPath = (newParent != null) ? newParent.getPath() + "/" + category.getCategoryId()
                : String.valueOf(category.getCategoryId());
        category.setPath(newPath);

        return InventoryCategoryResponseDto.from(category);
    }

    /**
     * 카테고리 삭제 (기본 카테고리는 삭제 방지)
     */
    @Transactional
    public void deleteCategory(Long categoryId) {
        InventoryCategory category = inventoryCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        if ("기본".equals(category.getName())) {
            throw new IllegalArgumentException("기본 카테고리는 삭제할 수 없습니다.");
        }

        inventoryCategoryRepository.delete(category);
    }

    /**
     * target이 potentialAncestor의 자손인지 확인
     */
    private boolean isDescendant(InventoryCategory potentialAncestor, InventoryCategory target) {
        InventoryCategory current = target.getParent();
        while (current != null) {
            if (current.getCategoryId().equals(potentialAncestor.getCategoryId())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }
}

