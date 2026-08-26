# 파일 구조

Vue 3·JavaScript 기반의 Feature 단위 구조를 사용합니다. 의존 방향은 `app → features → common`을 기본으로 합니다.

```text
Jaedaero_frontend/
├── docs/
│   ├── api-endpoint-mapping.md
│   ├── dashboard-api-mapping.md
│   ├── dashboard-personas.md
│   ├── file-structure.md
│   └── screen-data-spec.md
├── public/
│   └── icons/                       # PWA·파비콘
├── src/
│   ├── app/
│   │   ├── layouts/
│   │   ├── router/
│   │   └── App.vue
│   ├── assets/                      # 이미지·아이콘·폰트
│   ├── common/
│   │   ├── api/                     # Axios 클라이언트·엔드포인트
│   │   ├── auth/                    # 인증 세션 저장
│   │   ├── components/              # 공통 UI
│   │   ├── composables/             # 공통 Vue 로직
│   │   ├── constants/
│   │   └── styles/
│   ├── features/
│   │   ├── accounts/
│   │   ├── ai-analysis/
│   │   ├── auth/
│   │   ├── benefits/
│   │   ├── cashflow/
│   │   ├── challenges/
│   │   ├── dashboard/
│   │   ├── leave-mode/
│   │   ├── market-report/
│   │   ├── missions/
│   │   ├── my-page/
│   │   ├── notifications/
│   │   ├── onboarding/
│   │   ├── rebalancing/
│   │   ├── reports/
│   │   ├── simulations/
│   │   ├── soldier-savings/
│   │   └── transactions/
│   ├── firebase-messaging-sw.js     # FCM·PWA 서비스 워커
│   └── main.js                      # Vue·Pinia·Router 부트스트랩
├── .env.example
├── package.json
├── vercel.json
└── vite.config.js
```

## Feature 내부 규칙

기능에 필요한 폴더만 만듭니다.

| 폴더          | 역할                              |
| ------------- | --------------------------------- |
| `api`         | Axios API 요청과 서버 응답 반환   |
| `components`  | 해당 Feature 전용 UI              |
| `composables` | 화면 로직과 재사용 Vue 상태       |
| `constants`   | 해당 Feature의 고정 매핑          |
| `firebase`    | 알림 Feature의 Firebase 초기화    |
| `mappers`     | 백엔드 응답을 화면 모델로 변환    |
| `mocks`       | 명시적 화면 테스트 데이터         |
| `services`    | 브라우저·외부 SDK 연동            |
| `stores`      | 여러 화면에서 공유하는 Pinia 상태 |
| `utils`       | Vue 상태와 무관한 순수 변환 로직  |
| `views`       | Vue Router에 연결되는 페이지      |

도메인 라운팅은 현재 `src/features/auth/routes.js`, `src/features/onboarding/routes.js`, `src/app/router/main.js`로 나누어 관리합니다.

## 데이터 흐름

```text
View
  → Store 또는 Composable
  → Feature API
  → common/api/client.js
  → Backend
```

서버 응답과 화면 모델이 다를 때만 `mappers`를 사용합니다. 변환이 필요 없는 응답은 별도 계층을 만들지 않고 Store에서 그대로 관리합니다.

## 변경 동기화

| 변경                | 함께 확인할 파일                                                       |
| ------------------- | ---------------------------------------------------------------------- |
| API 경로·메서드     | `docs/api-endpoint-mapping.md`, `common/api/endpoints.js`, Feature API |
| 응답 필드·화면 모델 | `docs/screen-data-spec.md`, Mapper, Store, View                        |
| 라운트              | `docs/screen-data-spec.md`, Router, View                               |
| 대시보드 목         | `docs/dashboard-personas.md`, `dashboard/mocks`                        |

빈 폴더 유지용 placeholder는 두지 않습니다.
