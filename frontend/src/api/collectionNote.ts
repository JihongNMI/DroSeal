import { apiClient } from './apiClient';

export interface UserCollectionNoteDto {
    noteId: number;
    collectionItemId: number;
    displayNote?: string;
    askingPrice?: number;
    updatedAt: string;
}

export interface UserCollectionNoteRequestDto {
    displayNote?: string;
    askingPrice?: number;
}

export const fetchUserCollectionNote = async (collectionItemId: number): Promise<UserCollectionNoteDto | null> => {
    try {
        const response = await apiClient.get<UserCollectionNoteDto>(`/encyclopedia-note/${collectionItemId}`);
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

export const saveUserCollectionNote = async (collectionItemId: number, request: UserCollectionNoteRequestDto): Promise<UserCollectionNoteDto> => {
    const response = await apiClient.put<UserCollectionNoteDto>(`/encyclopedia-note/${collectionItemId}`, request);
    return response.data;
};
