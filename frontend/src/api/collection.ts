import { apiClient } from './apiClient';
import { PageableResponse } from './inventory';

export interface CollectionDto {
    collectionId: number;
    name: string;
    description?: string;
    isOfficial: boolean;
    isPublic: boolean;
    gridX: number;
    gridY: number;
    createdAt: string;
}

export interface CollectionCreateRequestDto {
    name: string;
    description?: string;
    categoryId: number;
    isOfficial?: boolean;
    isPublic?: boolean;
    gridX?: number;
    gridY?: number;
}

export interface CollectionProgressResponseDto {
    collectionId: number;
    categoryId: number;
    categoryName: string;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    isOfficial: boolean;
    isPublic: boolean;
    gridX: number;
    gridY: number;
    createdAt: string;
    totalItems: number;
    collectedItems: number;
}

export const fetchCollections = async (
    page: number = 0,
    size: number = 20,
    categoryId?: number,
    keyword?: string
): Promise<PageableResponse<CollectionProgressResponseDto>> => {
    const response = await apiClient.get<PageableResponse<CollectionProgressResponseDto>>('/collections', {
        params: { page, size, categoryId, keyword }
    });
    return response.data;
};

export const createCollection = async (request: CollectionCreateRequestDto): Promise<CollectionProgressResponseDto> => {
    const response = await apiClient.post<CollectionProgressResponseDto>('/collections', request);
    return response.data;
};

export const getCollectionProgress = async (collectionId: number): Promise<CollectionProgressResponseDto> => {
    const response = await apiClient.get<CollectionProgressResponseDto>(`/collections/${collectionId}/progress`);
    return response.data;
};

export interface CollectionItemCreateRequestDto {
    collectionId: number;
    name: string;
    itemNumber?: number;
    rarity?: string;
    imageUrl?: string;
    description?: string;
    vectorId?: string;
    imageHash?: string;
    isOfficial?: boolean;
}

export interface CollectionItemResponseDto {
    itemId: number;
    collectionId: number;
    name: string;
    itemNumber?: number;
    rarity?: string;
    imageUrl?: string;
    description?: string;
    isOfficial?: boolean;
    isOwned?: boolean;
}

export const createCollectionItem = async (request: CollectionItemCreateRequestDto): Promise<CollectionItemResponseDto> => {
    const response = await apiClient.post<CollectionItemResponseDto>('/collection-items', request);
    return response.data;
};

// 도감 아이템 전체 조회 (모든 아이템 가져오기) - 커스텀 도감용
export const fetchCollectionItems = async (collectionId: number): Promise<PageableResponse<CollectionItemResponseDto>> => {
    const response = await apiClient.get<PageableResponse<CollectionItemResponseDto>>('/collection-items/search', {
        params: { collectionId, size: 200 }
    });
    return response.data;
};

// 공식 도감 아이템 조회 (isOwned 보유 여부 포함) - 공식 도감(isOfficial=true)용
export const fetchCollectionItemsWithOwnership = async (collectionId: number): Promise<CollectionItemResponseDto[]> => {
    const response = await apiClient.get<CollectionItemResponseDto[]>(`/collections/${collectionId}/items`);
    return response.data;
};

// 인벤토리용: 모든 컬렉션 아이템 검색 (collectionId 없이)
export const searchCollectionItems = async (
    page: number = 0,
    size: number = 100
): Promise<PageableResponse<CollectionItemResponseDto>> => {
    const response = await apiClient.get<PageableResponse<CollectionItemResponseDto>>('/collection-items/search', {
        params: {
            page,
            size,
        },
    });
    return response.data;
};

export const updateCollectionItemImage = async (itemId: number, imageUrl: string): Promise<CollectionItemResponseDto> => {
    const response = await apiClient.patch<CollectionItemResponseDto>(`/collection-items/${itemId}`, { imageUrl });
    return response.data;
};

export const deleteCollection = async (collectionId: number): Promise<void> => {
    await apiClient.delete(`/collections/${collectionId}`);
};

export const deleteCollectionItem = async (collectionId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/collections/${collectionId}/items/${itemId}`);
};

export const updateCollectionThumbnail = async (collectionId: number, thumbnailUrl: string): Promise<void> => {
    const response = await apiClient.patch(`/collections/${collectionId}/thumbnail`, { thumbnailUrl });
    return response.data;
};
