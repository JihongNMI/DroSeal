package com.goodsplatform.service;

import com.goodsplatform.dto.request.CategoryCreateRequestDto;
import com.goodsplatform.dto.response.CategoryResponseDto;
import com.goodsplatform.entity.Category;
import com.goodsplatform.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * 카테고리 생성 로직
     * 부모 존재 여부에 따라 계층 구조(path)를 세팅합니다.
     */
    @Transactional
    public CategoryResponseDto createCategory(CategoryCreateRequestDto request) {
        Category parent = null;
        Integer newLevel = 1;

        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부모 카테고리입니다: " + request.getParentId()));
            newLevel = parent.getLevel() + 1;

            if (categoryRepository.existsByNameAndParent(request.getName(), parent)) {
                throw new IllegalArgumentException("해당 부모 카테고리 내에 이미 같은 이름의 카테고리가 존재합니다: " + request.getName());
            }
        } else {
            if (categoryRepository.existsByNameAndParentIsNull(request.getName())) {
                throw new IllegalArgumentException("최상위 계층에 이미 같은 이름의 카테고리가 존재합니다: " + request.getName());
            }
        }

        // 1. 카테고리 엔티티 생성 및 기본 저장 (ID 발급용)
        Category category = Category.builder()
                .name(request.getName())
                .parent(parent)
                .level(newLevel)
                .path("") // 임시
                .build();

        categoryRepository.save(category);

        // 2. 발급된 ID를 기반으로 path 설정
        String newPath = (parent != null) ? parent.getPath() + "/" + category.getCategoryId()
                : String.valueOf(category.getCategoryId());

        category.setPath(newPath);
        // 트랜잭션 종료 시 더티 체킹으로 path 업데이트 발생

        return CategoryResponseDto.from(category);
    }

    /**
     * 전체 트리 구조 조회
     */
    public List<CategoryResponseDto> getCategoryTree() {
        // 루트 요소만 가져오면 Entity에 선언된 cascade 설정과 DTO의 재귀적 파싱으로 트리가 완성됨
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return rootCategories.stream()
                .map(CategoryResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 부모 하위의 자식만 조회
     */
    public List<CategoryResponseDto> getChildren(Long parentId) {
        List<Category> children = categoryRepository.findByParent_CategoryId(parentId);
        return children.stream()
                .map(CategoryResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 카테고리 삭제 (기본 카테고리는 삭제 방지)
     */
    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        if ("기본".equals(category.getName())) {
            throw new IllegalArgumentException("기본 카테고리는 삭제할 수 없습니다.");
        }

        categoryRepository.delete(category);
    }
}
