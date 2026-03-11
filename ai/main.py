from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
from typing import List
import uvicorn
import logging
import cv2
import numpy as np
from ultralytics import YOLO
import io
from PIL import Image
import os
import json
import re
import torch
from transformers import CLIPProcessor, CLIPModel
from pinecone import Pinecone
import google.generativeai as genai
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

app = FastAPI(title="DRoSeal AI Pipeline")
logger = logging.getLogger("uvicorn")

# =========================================================================
# 1. 모델 및 서비스 초기화 영역 (서버 켤 때 한 번만 로드해서 속도 최적화)
# =========================================================================

# YOLO 모델 로드
logger.info("YOLOv8 모델 로딩 중...")
yolo_model = YOLO('yolov8n.pt')

# CLIP 모델 로드
logger.info("CLIP 모델 로딩 중... (시간 좀 걸려, 주인님)")
clip_model_id = "openai/clip-vit-base-patch32"
clip_processor = CLIPProcessor.from_pretrained(clip_model_id)
clip_base_model = CLIPModel.from_pretrained(clip_model_id)

# Pinecone 클라이언트 초기화
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "your-pinecone-api-key") # 꼭 실제 키 넣어야 해!
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "your-index-name")

pinecone_index = None # 초기화 필수 (연결 실패 대비)

try:
    if PINECONE_API_KEY and PINECONE_API_KEY != "your-pinecone-api-key":
        pc = Pinecone(api_key=PINECONE_API_KEY)
        pinecone_index = pc.Index(PINECONE_INDEX_NAME)
    else:
        logger.warning("Pinecone API 키가 설정되지 않았거나 기본값입니다.")
except Exception as e:
    logger.error(f"Pinecone 연결 에러: {e}")

# Gemini API 초기화
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your-gemini-api-key") # 여기도 필수!
genai.configure(api_key=GEMINI_API_KEY)

generation_config = {
    "temperature": 0.2, # 감정사니까 정확도를 위해 낮게 세팅
    "top_p": 0.95,
    "max_output_tokens": 1024,
    "response_mime_type": "application/json", # 무조건 JSON으로 반환하도록 강제
}
gemini_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash", # 404 에러 방지를 위해 플래시 모델 사용
    generation_config=generation_config,
)

# =========================================================================
# 2. 통신 DTO (Request / Response)
# =========================================================================

class ImagePayload(BaseModel):
    image_base64: str
    mime_type: str
    image_hash: str

class CollectionItemDraft(BaseModel):
    series: str
    characterName: str
    category: str
    extraDetails: str

class AnalyzeResponse(BaseModel):
    items: List[CollectionItemDraft]

# =========================================================================
# 3. 비즈니스 로직 헬퍼 함수
# =========================================================================

def get_image_embedding(image: Image.Image) -> list[float]:
    """CLIP을 사용해 이미지를 Vector로 변환"""
    inputs = clip_processor(images=image, return_tensors="pt")
    with torch.no_grad():
        features = clip_base_model.get_image_features(**inputs)
        
    # transformers 버전에 따라 Tensor가 아닌 BaseModelOutput 객체를 반환하는 경우 처리
    if not isinstance(features, torch.Tensor):
        features = features.pooler_output if hasattr(features, 'pooler_output') else features[0]

    # Cosine Similarity 검색을 위한 정규화
    features = features / features.norm(p=2, dim=-1, keepdim=True)
    return features.squeeze().tolist()

def search_similar_goods(embedding: list[float], top_k: int = 5) -> list[dict]:
    """Pinecone DB에서 유사 굿즈 검색"""
    if pinecone_index is None:
        logger.warning("Pinecone 인덱스가 활성화되지 않아 검색을 건너뜁니다.")
        return []

    response = pinecone_index.query(
        vector=embedding,
        top_k=top_k,
        include_metadata=True
    )
    candidates = [
        match.metadata for match in response.matches
        if match.metadata
    ]
    return candidates

def analyze_with_gemini(image: Image.Image, candidates: list[dict], cropped_status: str) -> dict:
    """Gemini에 이미지와 검색된 후보군 데이터를 던져서 최종 분석"""
    prompt = f"""
    당신은 서브컬처 굿즈 및 애니메이션 상품을 전문적으로 식별하는 최고 수준의 AI 감정사입니다.
    사용자가 제공한 '크롭된 상품 사진'과, DB에서 검색된 '유사 후보군 데이터'를 바탕으로 상품을 식별하세요.

    [YOLO 크롭 정보]
    {cropped_status}

    [유사 후보군 데이터 (Top 5)]
    {json.dumps(candidates, ensure_ascii=False, indent=2)}

    [작업 지시사항]
    1. 사진을 분석하고, 검색된 후보군 중 가장 일치하는 상품을 찾아내세요.
    2. 일치하는 게 없다면, 이미지 내 특징(캐릭터, 로고 등)을 기반으로 추론하세요.
    3. 결과는 반드시 제공된 JSON 포맷을 엄격하게 지켜 반환하세요.

    [출력 JSON 양식]
    {{
        "series": "작품명 또는 IP (예: 보컬로이드)",
        "characterName": "캐릭터명 (예: 하츠네 미쿠) 또는 상품명 자체",
        "category": "굿즈 종류 (예: 피규어, 아크릴 스탠드, 봉제인형 등)",
        "extraDetails": "제조사, 시세, 혹은 감정 사유 등 추가 정보"
    }}
    """
    response = gemini_model.generate_content([prompt, image])
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        # Gemini가 마크다운 코드블록(```json ... ```)으로 감싸서 반환한 경우 정규식으로 추출
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Gemini 응답 JSON 파싱 실패: {response.text}")

# =========================================================================
# 4. 메인 API 엔드포인트
# =========================================================================

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "pinecone": "connected" if pinecone_index is not None else "disconnected"
    }


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_image(payload: ImagePayload):
    try:
        # 1. Base64 이미지 디코딩
        image_bytes = base64.b64decode(payload.image_base64)
        logger.info(f"Received image: Hash={payload.image_hash}, Size={len(image_bytes)} bytes")

        # -------------------------------------------------------------
        # 1단계. 객체 탐지 및 크롭 (YOLOv8)
        # -------------------------------------------------------------
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_cv is None:
            raise ValueError("이미지 디코딩에 실패했어.")

        results = yolo_model(img_cv)
        cropped_img_cv = img_cv
        cropped_status = "No object detected (사용된 원본 이미지)"

        if len(results) > 0 and len(results[0].boxes) > 0:
            boxes = results[0].boxes
            best_box = max(boxes, key=lambda b: float(b.conf[0]))
            x1, y1, x2, y2 = map(int, best_box.xyxy[0])

            # 크롭 수행
            cropped_img_cv = img_cv[y1:y2, x1:x2]
            cropped_status = f"Cropped object from ({x1},{y1}) to ({x2},{y2})"

            # 디버깅용 저장 (DEBUG_SAVE_CROP=true 환경변수 설정 시에만 저장)
            if os.getenv("DEBUG_SAVE_CROP", "false").lower() == "true":
                cv2.imwrite(f"cropped_debug_{payload.image_hash}.jpg", cropped_img_cv)
        
        # OpenCV 이미지(BGR)를 PIL 이미지(RGB)로 변환 (CLIP & Gemini용)
        cropped_rgb = cv2.cvtColor(cropped_img_cv, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(cropped_rgb)

        # -------------------------------------------------------------
        # 2단계. 벡터 유사도 검색 (CLIP & Pinecone)
        # -------------------------------------------------------------
        logger.info("임베딩 값 추출 및 Pinecone 검색 시작...")
        embedding = get_image_embedding(pil_image)
        candidates = search_similar_goods(embedding)

        # -------------------------------------------------------------
        # 3단계. 상세 특징 추출 및 정제 (Gemini 1.5 Pro)
        # -------------------------------------------------------------
        logger.info("Gemini를 통한 멀티모달 최종 분석 중...")
        gemini_result_json = analyze_with_gemini(pil_image, candidates, cropped_status)

        # Gemini가 배열로 반환한 경우 첫 번째 요소 사용
        if isinstance(gemini_result_json, list):
            gemini_result_json = gemini_result_json[0] if gemini_result_json else {}

        # Gemini가 뱉어낸 JSON을 응답 DTO 규격에 맞게 변환
        final_item = CollectionItemDraft(
            series=gemini_result_json.get("series", "알 수 없음"),
            characterName=gemini_result_json.get("characterName", "알 수 없음"),
            category=gemini_result_json.get("category", "알 수 없음"),
            extraDetails=gemini_result_json.get("extraDetails", "추가 정보 없음")
        )

        return AnalyzeResponse(items=[final_item])

    except Exception as e:
        logger.error(f"분석 중 에러 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
