// Category API 클라이언트

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export interface CategoryDto {
  categoryId: number
  name: string
  path: string
  level: number
  createdAt: string
  children: CategoryDto[]
}

export interface CategoryCreateRequest {
  name: string
  parentId: number | null
}

export interface CategoryUpdateRequest {
  name: string
  parentId: number | null
}

/**
 * 전체 카테고리 트리 조회
 */
export async function fetchCategoryTree(): Promise<CategoryDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/inventory-categories/tree`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch category tree: ${response.statusText}`)
  }

  return response.json()
}

/**
 * 카테고리 생성
 */
export async function createCategory(request: CategoryCreateRequest): Promise<CategoryDto> {
  const response = await fetch(`${API_BASE_URL}/api/v1/inventory-categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Failed to create category: ${response.statusText}`)
  }

  return response.json()
}

/**
 * 카테고리 수정
 */
export async function updateCategory(id: number, request: CategoryUpdateRequest): Promise<CategoryDto> {
  const response = await fetch(`${API_BASE_URL}/api/v1/inventory-categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Failed to update category: ${response.statusText}`)
  }

  return response.json()
}

/**
 * 카테고리 삭제
 */
export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/inventory-categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Failed to delete category: ${response.statusText}`)
  }
}

/**
 * 특정 부모의 자식 카테고리 조회
 */
export async function fetchCategoryChildren(parentId: number): Promise<CategoryDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/inventory-categories/${parentId}/children`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch category children: ${response.statusText}`)
  }

  return response.json()
}
