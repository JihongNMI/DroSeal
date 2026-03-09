package com.goodsplatform.controller;

import com.goodsplatform.dto.request.CategoryCreateRequestDto;
import com.goodsplatform.dto.response.CategoryResponseDto;
import com.goodsplatform.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponseDto> createCategory(@Valid @RequestBody CategoryCreateRequestDto request) {
        CategoryResponseDto response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/tree")
    public ResponseEntity<List<CategoryResponseDto>> getCategoryTree() {
        return ResponseEntity.ok(categoryService.getCategoryTree());
    }

    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<CategoryResponseDto>> getChildren(@PathVariable("parentId") Long parentId) {
        return ResponseEntity.ok(categoryService.getChildren(parentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
