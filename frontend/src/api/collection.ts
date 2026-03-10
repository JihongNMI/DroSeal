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
}

export const createCollectionItem = async (request: CollectionItemCreateRequestDto): Promise<CollectionItemResponseDto> => {
    const response = await apiClient.post<CollectionItemResponseDto>('/collection-items', request);
    return response.data;
};
// 도감 열람 시 소속된 모든 아이템 가져오기
export const fetchCollectionItems = async (collectionId: number): Promise<PageableResponse<CollectionItemResponseDto>> => {
    // 앨범 내의 60개 등 전체 아이템을 가져올 목적으로 size를 넉넉하게 잡습니다.
    const response = await apiClient.get<PageableResponse<CollectionItemResponseDto>>('/collection-items/search', {
        params: { collectionId, size: 200 }
    });
    return response.data;
};

export const updateCollectionItemImage = async (itemId: number, imageUrl: string): Promise<CollectionItemResponseDto> => {
    const response = await apiClient.patch<CollectionItemResponseDto>(`/collection-items/${itemId}`, { imageUrl });
    return response.data;
};
