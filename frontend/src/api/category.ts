import { apiClient } from './apiClient';

export interface CategoryDto {
    categoryId: number;
    name: string;
    path: string;
    level: number;
    createdAt: string;
    children: CategoryDto[];
}

export interface CategoryCreateRequest {
    name: string;
    parentId?: number;
}

export const fetchCategoryTree = async (): Promise<CategoryDto[]> => {
    const response = await apiClient.get<CategoryDto[]>('/categories/tree');
    return response.data;
};

export const createCategory = async (request: CategoryCreateRequest): Promise<CategoryDto> => {
    const response = await apiClient.post<CategoryDto>('/categories', request);
    return response.data;
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
    await apiClient.delete(`/categories/${categoryId}`);
};
