// Category API 응답을 프론트엔드 타입으로 변환하는 어댑터

import type { InventoryCategory } from '../types'

// 백엔드 API 응답 타입
export interface CategoryDto {
  categoryId: number
  name: string
  path: string
  level: number
  createdAt: string
  children: CategoryDto[]
}

// DTO를 프론트 타입으로 변환 (재귀적으로 children 포함)
export function categoryDtoToFrontend(dto: CategoryDto, parentId?: string): InventoryCategory[] {
  const categories: InventoryCategory[] = []
  
  const currentCategory: InventoryCategory = {
    id: dto.categoryId.toString(),
    name: dto.name,
    parentId: parentId,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.createdAt), // updatedAt은 프론트 타입에만 존재 (createdAt으로 대체)
  }
  
  categories.push(currentCategory)
  
  // 자식 카테고리들도 변환 (재귀)
  if (dto.children && dto.children.length > 0) {
    dto.children.forEach(child => {
      const childCategories = categoryDtoToFrontend(child, currentCategory.id)
      categories.push(...childCategories)
    })
  }
  
  return categories
}

// 트리 구조를 flat 배열로 변환
export function categoryTreeToFlat(dtos: CategoryDto[]): InventoryCategory[] {
  const flatCategories: InventoryCategory[] = []
  
  dtos.forEach(dto => {
    const categories = categoryDtoToFrontend(dto)
    flatCategories.push(...categories)
  })
  
  return flatCategories
}

// 프론트 타입을 백엔드 생성 요청으로 변환
export function categoryToCreateRequest(category: Partial<InventoryCategory>) {
  return {
    name: category.name,
    parentId: category.parentId ? parseInt(category.parentId) : null
  }
}

// 프론트 타입을 백엔드 수정 요청으로 변환
export function categoryToUpdateRequest(category: Partial<InventoryCategory>) {
  return {
    name: category.name,
    parentId: category.parentId ? parseInt(category.parentId) : null
  }
}
