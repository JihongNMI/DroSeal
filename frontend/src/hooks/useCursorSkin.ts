import { useState, useEffect, useCallback } from 'react'
import {
    CursorSkinDto,
    fetchActiveCursorSkins,
    fetchCurrentUser,
    patchCursorSkin,
} from '../api/cursorSkin'

const STORAGE_KEY = 'selectedCursorSkinId'
const CHANGE_EVENT = 'cursorskin-changed'
const STYLE_ID = 'cursor-skin-override'

interface UseCursorSkinOptions {
    applyGlobalCursor?: boolean
}

// html 요소에 커서를 설정하고 custom-cursor 클래스를 추가해
// index.css의 "html.custom-cursor * { cursor: inherit !important }" 규칙이 전체에 적용되도록 함
// 그 위에 <style> 태그로 pointer/text 등 타입별 커서를 덮어씀
function setHtmlCursor(cursorValue: string) {
    document.documentElement.style.cursor = cursorValue
    document.documentElement.classList.add('custom-cursor')
}

function applyOverrideStyle(css: string) {
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!el) {
        el = document.createElement('style')
        el.id = STYLE_ID
        document.head.appendChild(el)
    }
    el.textContent = css
}

function clearCursorStyle() {
    document.documentElement.classList.remove('custom-cursor')
    document.documentElement.style.cursor = ''
    const el = document.getElementById(STYLE_ID)
    if (el) el.textContent = ''
}

export function useCursorSkin({ applyGlobalCursor = false }: UseCursorSkinOptions = {}) {
    const [skins, setSkins] = useState<CursorSkinDto[]>([])
    const [selectedSkinId, setSelectedSkinId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // 초기 로드: 스킨 목록 + 현재 유저 선택값
    useEffect(() => {
        const load = async () => {
            try {
                const [skinsData, userData] = await Promise.all([
                    fetchActiveCursorSkins(),
                    fetchCurrentUser(),
                ])
                setSkins(skinsData)
                console.log('[useCursorSkin] 초기 로드 완료 — skins:', skinsData.length, '/ userSkinId:', userData.cursorSkinId)

                if (userData.cursorSkinId != null) {
                    setSelectedSkinId(userData.cursorSkinId)
                    localStorage.setItem(STORAGE_KEY, String(userData.cursorSkinId))
                } else {
                    const saved = localStorage.getItem(STORAGE_KEY)
                    if (saved) setSelectedSkinId(Number(saved))
                }
            } catch (err) {
                console.warn('[useCursorSkin] 초기 로드 실패, localStorage 폴백:', err)
                const saved = localStorage.getItem(STORAGE_KEY)
                if (saved) setSelectedSkinId(Number(saved))
                try {
                    const skinsData = await fetchActiveCursorSkins()
                    setSkins(skinsData)
                } catch {
                    // 스킨 목록도 실패하면 빈 목록 유지
                }
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    // 다른 훅 인스턴스에서 selectSkin 호출 시 동기화 (App.tsx ↔ MyPage.tsx)
    useEffect(() => {
        const handler = (e: Event) => {
            const { skinId } = (e as CustomEvent<{ skinId: number }>).detail
            console.log('[useCursorSkin] cursorskin-changed 수신 — skinId:', skinId, '/ applyGlobalCursor:', applyGlobalCursor)
            setSelectedSkinId(skinId)
        }
        window.addEventListener(CHANGE_EVENT, handler)
        return () => window.removeEventListener(CHANGE_EVENT, handler)
    }, [applyGlobalCursor])

    // [BUG FIX 1] 전역 커서 애니메이션: <style> 태그 !important 방식
    useEffect(() => {
        if (!applyGlobalCursor) return

        if (selectedSkinId == null || skins.length === 0) {
            clearCursorStyle()
            return
        }

        const skin = skins.find(s => s.id === selectedSkinId)
        if (!skin) {
            console.warn('[useCursorSkin] selectedSkinId에 해당하는 스킨 없음:', selectedSkinId, '/ 보유 skins:', skins.map(s => s.id))
            clearCursorStyle()
            return
        }

        console.log('[useCursorSkin] 커서 애니메이션 시작 — skin:', skin.characterName, '/ frames:', skin.frameCount, '/ frameTime:', skin.frameTime)

        // [BUG FIX 3] 첫 프레임 즉시 적용 (setInterval은 첫 실행이 frameTime ms 후라서 지연 발생)
        let frame = 0
        const applyFrame = (f: number) => {
            const padded = String(f).padStart(2, '0')
            const b = `/cursors/${skin.characterName}/output`
            const u = (folder: string, x = 0, y = 0, fallback = 'auto') =>
                `url('${b}/${folder}/frame_${padded}.png') ${x} ${y}, ${fallback}`

            // html 인라인 스타일로 기본 커서 설정 (최고 우선순위)
            // index.css의 "html.custom-cursor * { cursor: inherit !important }" 가 전파를 담당
            setHtmlCursor(u('normal', 0, 0, 'auto'))

            // html.custom-cursor 접두사로 specificity를 높여 inherit 규칙을 덮어씀
            applyOverrideStyle(`
                html.custom-cursor a,
                html.custom-cursor button,
                html.custom-cursor [role="button"],
                html.custom-cursor [type="button"],
                html.custom-cursor [type="submit"],
                html.custom-cursor [type="reset"],
                html.custom-cursor .cursor-pointer,
                html.custom-cursor label,
                html.custom-cursor select {
                    cursor: ${u('link', 16, 16, 'pointer')} !important;
                }
                html.custom-cursor .cursor-text,
                html.custom-cursor input[type="text"],
                html.custom-cursor input[type="email"],
                html.custom-cursor input[type="password"],
                html.custom-cursor input[type="search"],
                html.custom-cursor textarea,
                html.custom-cursor [contenteditable] {
                    cursor: ${u('text', 16, 16, 'text')} !important;
                }
                html.custom-cursor .cursor-move {
                    cursor: ${u('move', 16, 16, 'move')} !important;
                }
                html.custom-cursor .cursor-crosshair {
                    cursor: ${u('precision', 16, 16, 'crosshair')} !important;
                }
                html.custom-cursor .cursor-help {
                    cursor: ${u('help', 0, 0, 'help')} !important;
                }
                html.custom-cursor .cursor-progress {
                    cursor: ${u('busy', 16, 16, 'progress')} !important;
                }
                html.custom-cursor .cursor-wait,
                html.custom-cursor [aria-busy="true"] {
                    cursor: ${u('working', 16, 16, 'wait')} !important;
                }
                html.custom-cursor .cursor-not-allowed,
                html.custom-cursor :disabled,
                html.custom-cursor [disabled] {
                    cursor: ${u('unavailable', 16, 16, 'not-allowed')} !important;
                }
            `)
        }

        applyFrame(frame)
        frame = (frame + 1) % skin.frameCount

        const interval = setInterval(() => {
            applyFrame(frame)
            frame = (frame + 1) % skin.frameCount
        }, skin.frameTime)

        return () => {
            clearInterval(interval)
            clearCursorStyle()
        }
    }, [applyGlobalCursor, selectedSkinId, skins])

    // [BUG FIX 2] Optimistic update: API 성공 여부와 무관하게 즉시 UI 반영
    const selectSkin = useCallback(async (skinId: number) => {
        console.log('[useCursorSkin] selectSkin 호출 — skinId:', skinId)

        // 즉시 UI 반영
        setSelectedSkinId(skinId)
        localStorage.setItem(STORAGE_KEY, String(skinId))
        window.dispatchEvent(
            new CustomEvent<{ skinId: number }>(CHANGE_EVENT, { detail: { skinId } })
        )
        console.log('[useCursorSkin] cursorskin-changed dispatch 완료')

        // 백엔드 저장은 best-effort
        setIsSaving(true)
        try {
            await patchCursorSkin(skinId)
            console.log('[useCursorSkin] PATCH /users/me/cursor-skin 성공')
        } catch (error) {
            console.error('[useCursorSkin] PATCH 실패 (커서는 이미 변경됨):', error)
        } finally {
            setIsSaving(false)
        }
    }, [])

    return { skins, selectedSkinId, selectSkin, isLoading, isSaving }
}
