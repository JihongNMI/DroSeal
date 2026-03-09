import { apiClient } from './apiClient';

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ imageUrl: string }>('/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.imageUrl;
};

export const analyzeImage = async (file: File): Promise<any[]> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<any[]>('/goods/analyze', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};
