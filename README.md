# 🪖 제대로 (Jaedaero) Frontend

전역 예정 장병의 **확정 소득과 실제 금융 데이터**를 기반으로 전역 예상 자산, 재정적 전역일과 목표 달성 전략을 제공하는 군 특화 AI 자산관리 서비스의 Vue 프론트엔드 프로젝트입니다.

## 기술 스택

- Vue 3
- JavaScript
- Vite
- Pinia
- Vue Router
- Axios
- json-server

> TypeScript를 사용하지 않습니다. `.ts`, `.tsx`, `tsconfig.json`, `vue-tsc`, `<script setup lang="ts">`를 사용하지 않고 모든 로직은 `.js`와 `<script setup>`으로 작성합니다.

## 주요 MVP 기능

1. 소셜 로그인 및 온보딩
2. CODEF 계좌 연동과 통합 자산 조회
3. 확정소득 캐시플로우 및 재정적 전역일
4. What-if 자산 시뮬레이션
5. AI 금융 분석 리포트
6. 미션 및 투자 뱃지
7. 이벤트 등록과 휴가모드
8. 동기 코호트 비교
9. 마이페이지 및 알림 설정

## 문서 및 목데이터

```text
docs/
├── file-structure.md          # MVP 기능별 전체 파일 구조
├── screen-data-spec.json      # 화면별 데이터 타입 명세
└── package-scripts.example.json

mock-server/
├── db.json                    # json-server용 실제 목데이터
└── README.md                  # 목 API 경로와 사용법
```

- 화면 데이터 명세: [`docs/screen-data-spec.json`](docs/screen-data-spec.json)
- 파일 구조 설명: [`docs/file-structure.md`](docs/file-structure.md)
- 목 API 데이터: [`mock-server/db.json`](mock-server/db.json)
- json-server 사용법: [`mock-server/README.md`](mock-server/README.md)

## 프로젝트 구조

프로젝트는 파일 종류별 구조가 아닌 **MVP 기능별 Feature 구조**를 사용합니다.

```text
frontend/
├── docs/
│   ├── file-structure.md
│   ├── screen-data-spec.json
│   └── package-scripts.example.json
├── mock-server/
│   ├── db.json
│   └── README.md
├── public/
├── src/
│   ├── app/
│   │   ├── layouts/
│   │   ├── router/
│   │   └── App.vue
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── dashboard/
│   │   ├── accounts/
│   │   ├── cashflow/
│   │   ├── ai-coach/
│   │   ├── missions/
│   │   ├── events/
│   │   ├── vacation/
│   │   ├── cohort/
│   │   └── my-page/
│   ├── common/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   └── endpoints.js
│   │   ├── components/
│   │   ├── composables/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── styles/
│   ├── assets/
│   └── main.js
├── .env.example
├── jsconfig.json
├── package.json
└── vite.config.js
```

상세 폴더 책임과 기능 내부 구조는 `docs/file-structure.md`를 확인합니다.

## json-server 기반 프론트엔드 테스트

실제 Spring 백엔드, CODEF, AI API를 호출하지 않고 `mock-server/db.json`으로 화면을 개발하고 테스트합니다.

### 1. 패키지 설치

```bash
npm install --save-dev json-server concurrently
```

### 2. package.json 스크립트 추가

```json
{
  "scripts": {
    "dev": "vite",
    "mock": "json-server mock-server/db.json --port 3001",
    "dev:mock": "concurrently -k -n VITE,MOCK \"npm run dev\" \"npm run mock\"",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 3. 환경변수 설정

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_USE_MOCK_SERVER=true
```

### 4. 목 서버만 실행

```bash
npm run mock
```

### 5. Vue와 목 서버 동시 실행

```bash
npm run dev:mock
```

실행 주소:

```text
Vue:        http://localhost:5173
json-server: http://localhost:3001
```

## 주요 목 API

```text
GET /users/1
GET /soldierProfiles?userId=1
GET /goals?userId=1
GET /connectedAccounts?userId=1
GET /dashboardSummaries?userId=1
GET /assetProjections?userId=1
GET /transactions?userId=1
GET /cashflowProjections?userId=1
GET /simulations?userId=1
GET /aiReports?userId=1
GET /missions
GET /investmentBadges?userId=1
GET /events?userId=1
GET /vacationModes?userId=1
GET /benefits?isActive=true
GET /cohortComparisons?userId=1
GET /notifications?userId=1
```

json-server는 기본적으로 조회뿐 아니라 `POST`, `PATCH`, `DELETE`도 지원하므로 이벤트 등록, 미션 완료, 거래 카테고리 변경, 알림 읽음 처리 등을 백엔드 없이 테스트할 수 있습니다.

## Axios 설정

`src/common/api/client.js`

```js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
```

기능별 API 파일에서는 주소를 직접 반복하지 않고 `src/common/api/endpoints.js`를 사용합니다.

```js
import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export const getDashboard = async (userId = 1) => {
  const { data } = await apiClient.get(ENDPOINTS.dashboard(userId))
  return data[0] || null
}
```

## 화면별 데이터 타입 명세 운영 원칙

TypeScript를 사용하지 않기 때문에 화면별 데이터 계약을 `docs/screen-data-spec.json`으로 관리합니다.

- 금액: 원 단위 `number`
- 비율: `number`
- 날짜: `YYYY-MM-DD` 문자열
- 날짜 및 시각: ISO 8601 문자열
- 상태값: 명세에 정의된 enum 문자열
- 선택값: `null` 허용 여부를 명세에 표시

화면 데이터 구조를 변경할 때 다음 파일을 함께 수정합니다.

1. `docs/screen-data-spec.json`
2. `mock-server/db.json`
3. 해당 기능의 `api/*.api.js`
4. 해당 화면 또는 컴포넌트

## 환경변수

프로젝트 루트에 `.env`를 생성합니다.

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_USE_MOCK_SERVER=true
VITE_GOOGLE_CLIENT_ID=
VITE_KAKAO_CLIENT_ID=
```

실제 백엔드 연결 시 다음 값만 변경합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_SERVER=false
```

API Secret은 프론트엔드에 저장하거나 Git에 업로드하지 않습니다.

## 실행 방법

```bash
npm install
npm run dev:mock
```

프로덕션 빌드:

```bash
npm run build
```

## 백엔드 연동 전환

```text
개발 단계
Vue → json-server → mock-server/db.json

실제 연동
Vue → Spring Framework → MyBatis → MySQL
                           ├→ CODEF
                           ├→ 캐시플로우 엔진
                           └→ AI 분석 API
```
