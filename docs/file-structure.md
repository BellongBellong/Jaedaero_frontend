# 파일 구조 문서

이 프로젝트는 Vue 3와 JavaScript를 사용하며 MVP 도메인별 Feature 구조를 사용합니다.
공통 코드는 `common`에 두고 의존 방향은 `app → features → common`으로 유지합니다.

```text
frontend/
├── docs/
│   ├── api-endpoint-mapping.md
│   ├── screen-data-spec.md
│   └── file-structure.md
├── public/
├── src/
│   ├── app/
│   │   ├── layouts/
│   │   ├── router/
│   │   └── App.vue
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
│   │   ├── missions/
│   │   ├── reports/
│   │   ├── rebalancing/
│   │   ├── notifications/
│   │   ├── leave-mode/
│   │   ├── market-report/
│   │   └── my-page/
│   ├── common/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   └── endpoints.js
│   │   ├── components/
│   │   ├── composables/
│   │   ├── constants/
│   │   ├── styles/
│   │   └── utils/
│   ├── assets/
│   ├── mocks/
│   └── main.js
├── .env.example
├── jsconfig.json
├── package.json
└── vite.config.js
```

## Feature 내부 구조

기능 규모에 따라 필요한 폴더만 생성합니다.

```text
features/dashboard/
├── api/
│   └── dashboard.api.js
├── components/
├── composables/
├── stores/
├── views/
└── routes.js
```

- `api`: Axios 기반 API 요청과 응답 데이터 반환
- `components`: 해당 기능에서만 사용하는 UI
- `composables`: 조회 상태와 화면 로직 및 API 호출 흐름, 로딩·오류 상태, 계산 및 여러 UI가 공유하는 동작
- `stores`: 여러 화면에서 공유하거나 장기간 유지해야 하는 전역 상태
- `views`: Vue Router와 연결되는 페이지 구성
- `routes.js`: 해당 기능의 라우트 배열
- `utils`: Vue 상태와 무관한 단순 계산·변환 함수
- `mappers`: 백엔드 응답을 프론트 화면 데이터로 변환


## 데이터 계약 연결 원칙

1. `docs/screen-data-spec.md`에서 백엔드 DTO 기반 화면 데이터 계약을 정의합니다.
2. `docs/api-endpoint-mapping.md`에 명시된 API만 호출합니다.
3. 기능별 API는 `src/common/api/endpoints.js`의 경로를 사용합니다.
4. 실제 백엔드 연결 시 `VITE_API_BASE_URL`만 변경합니다.

빈 폴더는 저장소에서 유지될 수 있도록 `example.vue` placeholder를 둡니다. 실제 파일을
추가하면 placeholder는 제거할 수 있습니다.
