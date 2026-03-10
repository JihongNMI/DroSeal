package com.goodsplatform.controller;

import com.goodsplatform.dto.request.InventoryCategoryCreateRequestDto;
import com.goodsplatform.dto.request.InventoryCategoryUpdateRequestDto;
import com.goodsplatform.dto.response.InventoryCategoryResponseDto;
import com.goodsplatform.service.InventoryCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory-categories")
@RequiredArgsConstructor
public class InventoryCategoryController {

    private final InventoryCategoryService inventoryCategoryService;

    @PostMapping
    public ResponseEntity<InventoryCategoryResponseDto> createCategory(@Valid @RequestBody InventoryCategoryCreateRequestDto request) {
        InventoryCategoryResponseDto response = inventoryCategoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/tree")
    public ResponseEntity<List<InventoryCategoryResponseDto>> getCategoryTree() {
        return ResponseEntity.ok(inventoryCategoryService.getCategoryTree());
    }

    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<InventoryCategoryResponseDto>> getChildren(@PathVariable("parentId") Long parentId) {
        return ResponseEntity.ok(inventoryCategoryService.getChildren(parentId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryCategoryResponseDto> updateCategory(
            @PathVariable("id") Long id,
            @Valid @RequestBody InventoryCategoryUpdateRequestDto request) {
        InventoryCategoryResponseDto response = inventoryCategoryService.updateCategory(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
        inventoryCategoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
