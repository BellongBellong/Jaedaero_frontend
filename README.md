# 🪖 제대로 (Jaedaero) Frontend

전역 예정 장병의 확정 소득과 금융 데이터를 기반으로 미래 자산을 예측하고 관리하는 AI 금융 서비스의 프론트엔드 프로젝트입니다.

## 주요 기능

* Google·Kakao 소셜 로그인
* CODEF 금융 데이터 연동
* 군인 인증 및 군 복무 정보 등록
* 목표 금액·투자 성향 설정
* 현재 자산 및 전역 예상 자산 조회
* 목표 달성률·소비·저축 현황 대시보드
* AI Financial Coach
* What-if 자산 시뮬레이션
* 금융상품 및 군인 혜택 추천

## 기술 스택

* Vue.js
* JavaScript
* Vite
* Pinia
* Vue Router
* Axios

## 실행 방법

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 환경변수

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=
VITE_KAKAO_CLIENT_ID=
```

API Key와 Secret 값은 Git에 업로드하지 않습니다.

## 프로젝트 구조

```text
src/
├── api/          # 백엔드 API 요청
├── assets/       # 이미지 및 스타일
├── auth/         # 로그인(소셜 로그인)
├── components/   # 공통 컴포넌트
├── constants/    # 온보딩 옵션
├── pages/        # 페이지 컴포넌트
├── router/       # 페이지 라우팅
├── service/      
├── stores/       # 전역 상태 관리
├── styles/       
├── App.vue
└── main.js
```

## 백엔드 연동

프론트엔드는 Spring Framework 기반 백엔드 API와 통신합니다.

```text
Vue → Spring Framework → MyBatis → MySQL
                         ↓
                       CODEF
                         ↓
                캐시플로우 엔진
                         ↓
                      OpenAI
```

## 서비스 핵심

> 제대로는 군 장병의 현재 금융 현황과 확정된 미래 소득을 분석하여 전역 시점의 예상 자산과 목표 달성 가능성을 제공하는 군 특화 AI 자산관리 플랫폼입니다.
