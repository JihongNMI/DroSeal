import { apiClient } from './apiClient';

export interface PageableResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export type RegistrationType = 'AUTO' | 'MANUAL';

export interface InventoryItemDto {
    inventoryId: number;
    collectionItemId?: number;
    collectionItemName?: string;
    categoryId?: number;
    categoryName?: string;
    customName?: string;
    regType: RegistrationType;
    aiConfidence?: number;
    location?: string;
    userImageUrl?: string;
    note?: string;
    purchasedPrice?: number;
    purchasedAt?: string;
    createdAt: string;
}

export interface InventoryItemCreateRequest {
    itemId?: number;
    categoryId?: number;
    customName?: string;
    regType: RegistrationType;
    aiConfidence?: number;
    location?: string;
    userImageUrl?: string;
    note?: string;
    purchasedPrice?: number;
    purchasedAt?: string;
}

export interface InventorySearchCondition {
    // Add specific search fields if needed from backend DTO
}

export const fetchMyInventoryItems = async (
    page: number = 0,
    size: number = 20,
    condition?: InventorySearchCondition
): Promise<PageableResponse<InventoryItemDto>> => {
    const response = await apiClient.get<PageableResponse<InventoryItemDto>>('/inventory', {
        params: {
            page,
            size,
            ...condition,
        },
    });
    return response.data;
};

export const createInventoryItem = async (request: InventoryItemCreateRequest): Promise<InventoryItemDto> => {
    const response = await apiClient.post<InventoryItemDto>('/inventory', request);
    return response.data;
};

export const fetchInventoryItemByCollectionItemId = async (collectionItemId: number): Promise<InventoryItemDto | null> => {
    try {
        const response = await apiClient.get<InventoryItemDto>(`/inventory/collection-item/${collectionItemId}`);
        // 204 No Content handling is sometimes empty string in Axios
        if (response.status === 204 || !response.data) {
            return null;
        }
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};

export interface InventoryItemUpdateRequest {
    categoryId?: number;
    note?: string;
    purchasedPrice?: number;
}

export const updateInventoryItemNoteAndPrice = async (inventoryId: number, request: InventoryItemUpdateRequest): Promise<InventoryItemDto> => {
    const response = await apiClient.patch<InventoryItemDto>(`/inventory/${inventoryId}`, request);
    return response.data;
};

export const deleteInventoryItem = async (inventoryId: number): Promise<void> => {
    await apiClient.delete(`/inventory/${inventoryId}`);
};
