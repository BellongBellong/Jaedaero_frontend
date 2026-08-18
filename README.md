# 🪖 제대로 (Jaedaero) Frontend

전역 예정 장병의 확정소득과 금융 데이터를 기반으로 전역 예상 자산, 재정적 전역일과 목표 달성 전략을 제공하는 군 특화 AI 자산관리 서비스의 Vue 프론트엔드 프로젝트입니다.

## 기술 스택

- Vue 3
- JavaScript
- Vite
- Pinia
- Vue Router
- Axios
- json-server 0.17.4

> TypeScript를 사용하지 않습니다. `.ts`, `.tsx`, `tsconfig.json`, `vue-tsc`, `<script setup lang="ts">`를 사용하지 않고 `.js`와 `<script setup>`을 사용합니다.

## 주요 MVP 기능

1. Google·Kakao 소셜 로그인과 온보딩
2. CODEF 계좌 연동 및 통합 자산 조회
3. 확정소득 캐시플로우와 재정적 전역일
4. What-if 시뮬레이션과 히스토리
5. AI 분석, 추천 전략 적용 및 적용 이력
6. 거래내역 조회와 카테고리 수정
7. 장병내일준비적금 납입·매칭지원금 조회
8. 동기 그룹 비교, 오늘의 미션, 투자 뱃지
9. 전역 리포트, 금융상품 추천, 군인 혜택
10. 리밸런싱 추천
11. 알림·FCM, 휴가모드, 오늘의 AI 투자 리포트

## 문서

```text
docs/
├── api-endpoint-mapping.md       # 제공된 API 명세 전체 반영표
├── screen-data-spec.md           # 화면별 DTO와 필드 타입 명세
├── file-structure.md             # MVP 기능별 파일 구조
└── package-scripts.example.json
```

- [API 명세 반영표](docs/api-endpoint-mapping.md)
- [화면별 데이터 타입 명세서](docs/screen-data-spec.md)
- [파일 구조 문서](docs/file-structure.md)

## 프로젝트 구조

```text
frontend/
├── docs/
├── public/
├── src/
│   ├── app/
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── accounts/
│   │   ├── dashboard/
│   │   ├── cashflow/
│   │   ├── simulations/
│   │   ├── ai-analysis/
│   │   ├── transactions/
│   │   ├── soldier-savings/
│   │   ├── challenges/
│   │   ├── reports/
│   │   ├── rebalancing/
│   │   ├── notifications/
│   │   ├── leave-mode/
│   │   ├── market-report/
│   │   └── my-page/
│   ├── common/
│   │   └── api/
│   │       ├── client.js
│   │       └── endpoints.js
│   └── main.js
├── .env.example
├── jsconfig.json
├── package.json
└── vite.config.js
```

상세 구조는 `docs/file-structure.md`에서 확인합니다.

## API 데이터 계약

```text
POST   /api/v1/auth/login
POST   /api/v1/onboarding/military-info
POST   /api/v1/accounts/connect
GET    /api/v1/accounts
GET    /api/v1/dashboard
GET    /api/v1/cashflow?months=8
POST   /api/v1/simulations
GET    /api/v1/simulations?page=0&size=20
POST   /api/v1/ai-analyses
GET    /api/v1/transactions
PUT    /api/v1/transactions/4/category
GET    /api/v1/missions/today
POST   /api/v1/missions/2/complete
GET    /api/v1/reports/discharge
GET    /api/v1/rebalancing/recommendations
GET    /api/v1/notifications?page=0&size=20
GET    /api/v1/leave-mode/current
GET    /api/v1/market-reports/today
```

전체 엔드포인트는 `docs/api-endpoint-mapping.md`에 정리되어 있습니다.

## Axios 설정

`src/common/api/client.js`

```js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
```

경로는 `src/common/api/endpoints.js`에서 통합 관리합니다.

## 화면별 데이터 계약 관리

TypeScript 대신 `docs/screen-data-spec.md`를 화면 데이터 계약으로 사용합니다.

- 금액: 원 단위 `number`
- 날짜: `YYYY-MM-DD`
- 시각: ISO 8601
- 상태값: Enum 문자열
- 응답 DTO 명칭: 백엔드 API 명세와 동일하게 유지

데이터 필드가 변경되면 다음 파일을 함께 수정합니다.

1. `docs/screen-data-spec.md`
2. `src/common/api/endpoints.js`
3. 해당 Feature의 `api/*.api.js`

## 제공된 API 명세에 없는 기능

아래 기능은 프론트엔드에서 임의 엔드포인트를 만들지 않고 백엔드 확정 전까지 제한합니다.

- 이벤트 등록·수정·삭제
- 휴가모드 종료
- 알림 수신 설정
- 프로필 전체 조회
- 계좌 해제·수동 동기화

세부 내용은 `docs/api-endpoint-mapping.md`의 API 공백 표를 확인합니다.

## 실제 백엔드 전환

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

```text
개발/운영: Vue → Spring Framework → MyBatis → MySQL
                              ├→ CODEF
                              ├→ 캐시플로우 엔진
                              └→ AI 분석 API
```

API Secret과 Client Secret은 프론트엔드에 저장하지 않습니다.
