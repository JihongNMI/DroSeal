import { apiClient } from './apiClient'

export interface CursorSkinDto {
    id: number
    name: string
    characterName: string
    folderPath: string
    frameCount: number
    frameTime: number
}

export interface UserMeDto {
    userId: number
    username: string
    cursorSkinId: number | null
    cursorSkinCharacterName: string | null
    cursorSkinFolderPath: string | null
    frameCount: number | null
    frameTime: number | null
}

export const fetchActiveCursorSkins = async (): Promise<CursorSkinDto[]> => {
    const response = await apiClient.get<CursorSkinDto[]>('/cursor-skins')
    return response.data
}

export const fetchCurrentUser = async (): Promise<UserMeDto> => {
    const response = await apiClient.get<UserMeDto>('/users/me')
    return response.data
}

export const patchCursorSkin = async (cursorSkinId: number): Promise<UserMeDto> => {
    const response = await apiClient.patch<UserMeDto>('/users/me/cursor-skin', { cursorSkinId })
    return response.data
}
