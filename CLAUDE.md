# CLAUDE.md

## 규칙
- 모든 답변은 **한국어**로 해줘
- 코드 변경 전 반드시 나에게 먼저 확인해줘
- 개발인원 2명이라 간결하고 유지보수하기 쉬운 코드 우선
- 수정 시 관련 파일 범위 최소화

## 프로젝트 개요

**DroSeal** — 애니/게이밍 굿즈 컬렉션 관리 풀스택 앱 (3개 독립 서비스)

| 서비스 | 스택 | 포트 |
|--------|------|------|
| Backend | Java 17 / Spring Boot 3.2 | 8080 |
| Frontend | React 18 / TypeScript / Vite | 5173 |
| AI Server | Python / FastAPI | 8000 |

## 아키텍처

### 통신 구조
- Frontend `/api` → Backend `localhost:8080` (Vite 프록시)
- Axios 클라이언트: `frontend/src/api/apiClient.ts`
- 비동기 AI 서버 통신: Spring WebFlux 사용

### 인증
JWT Stateless 방식. 로그인 → Bearer 토큰 발급 → 클라이언트 저장 → 매 요청 `Authorization` 헤더 첨부. 만료: 24h. `JwtAuthenticationFilter`에서 검증.

### 프론트엔드 상태관리
Redux/Zustand 없음. `frontend/src/hooks/`의 커스텀 훅으로 관리 (`useInventory`, `useCategories`, `useEncyclopedias`). React Router v6 lazy-load.

### AI 파이프라인 (3단계)
1. **YOLOv8** — 이미지에서 객체 감지/크롭
2. **CLIP + Pinecone** — 벡터 임베딩 후 유사 아이템 Top-5 검색 (Cosine Similarity)
3. **Gemini 1.5 Flash** — 이미지 + 후보군 분석 → `{ series, characterName, category, extraDetails }` 반환

### 파일 업로드
`POST /api/v1/upload` → `backend/uploads/` 저장 → `localhost:8080/uploads/<filename>` 서빙. 최대 50MB. (`WebMvcConfig.java` 설정)

### 데이터베이스
MariaDB `localhost:3306` / DB명 `alpha` / DDL: `update`
엔티티 계층: `Users → Collections/InventoryItems → CollectionItems/PriceHistory → Transactions`
복잡한 쿼리는 Querydsl 사용 (`InventoryItemRepositoryCustomImpl`)

## 주요 설정 파일

| 파일 | 용도 |
|------|------|
| `backend/src/main/resources/application.yml` | DB, JWT, Gemini API Key, 파일 업로드 설정 |
| `frontend/vite.config.ts` | 프록시, 포트, 코드 스플리팅 |
| `frontend/.env` | `VITE_API_URL`, `VITE_APP_TITLE` |
| `ai/.env` | `GEMINI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX_NAME` |

## 기술 스택 요약

**Backend**: Java 17, Spring Boot 3.2, Spring Security, JPA/Hibernate, Querydsl 5, JJWT 0.12, MariaDB, WebFlux

**Frontend**: TypeScript 5.2, React 18, React Router 6, Axios, Tailwind CSS 3, dnd-kit, Vitest

**AI**: Python, FastAPI, YOLOv8, CLIP, Pinecone, Gemini 1.5 Flash, OpenCV, NumPy