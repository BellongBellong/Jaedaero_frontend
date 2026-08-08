# 대시보드 백엔드 API 매핑

## 기준 명세

- Swagger UI: <https://jaedaerobackend-production.up.railway.app/swagger-ui/index.html>
- 확인일: 2026-08-08
- 컨트롤러: `Dashboard Controller`
- API: `GET /api/v1/dashboard`
- 인증: Bearer Access Token 필수
- 요청 파라미터: 없음

개발 서버는 `vite.config.js`에서 `/api` 요청을 Railway 백엔드로 프록시합니다.
`src/common/api/client.js`는 `localStorage.accessToken`을 읽어 `Authorization: Bearer {token}`을
자동으로 추가합니다.

## 실행 흐름

```text
DashboardView.vue
  → useDashboard.js
  → dashboard.api.js
  → GET /api/v1/dashboard
  → dashboardResponse.mapper.js
  → 기존 대시보드 화면 모델
```

- `/home`: 백엔드 API를 조회합니다.
- `/home?persona=...` 또는 `/home?scenario=...`: 화면 상태 테스트를 위해 목데이터만 사용합니다.
- API가 실패하면 화면이 완전히 비지 않도록 기본 목데이터를 표시합니다. 실패 원인은
  `useDashboard()`의 `error`, 현재 데이터 출처는 `source`에서 확인할 수 있습니다.

## 응답 필드 매핑

| 백엔드 응답                     | 프론트 화면 모델                         | 사용 화면          | 변환                      |
| ------------------------------- | ---------------------------------------- | ------------------ | ------------------------- |
| `financialDischargeDate`        | `financialDday.financialDischargeDate`   | 재정적 전역일      | 날짜 유지                 |
| `actualDischargeDate`           | `financialDday.actualDischargeDate`      | 실제 전역일        | 날짜 유지                 |
| 두 전역일 날짜                  | `financialDday`, `actualDday`            | D-day              | 오늘 기준으로 프론트 계산 |
| `currentAsset`                  | `financialDday.currentAsset`             | 순자산·말풍선      | 원 → 만원                 |
| `currentAsset`                  | `assetSummary.total.totalAsset`          | 총 자산            | 원 유지                   |
| `expectedAsset`                 | `assetSummary.forecast.totalAmount`      | 전역 예상 자산     | 원 유지                   |
| `achievementRate`               | `financialDday.achievementRate`          | 목표 달성률        | `%` 유지                  |
| `thisMonthIncome`               | `assetSummary.monthly.income.amount`     | 이번 달 수입       | 원 유지                   |
| `thisMonthInvestment`           | `assetSummary.monthly.investment.amount` | 이번 달 투자       | 원 유지                   |
| `monthlyInvestmentGoal`         | `investment.monthlyPaymentTarget`        | 월 납입 목표       | 원 유지                   |
| `investmentGoalAchievementRate` | `investment.goalAchievementRate`         | 투자 목표 달성률   | `%` 유지                  |
| `thisMonthSpending`             | `assetSummary.monthly.spending.amount`   | 이번 달 지출       | 원 유지                   |
| `monthlySpendingGoal`           | `spending.targetAmount`                  | 지출 목표          | 원 유지                   |
| `spendingGoalAchievementRate`   | `spending.goalAchievementRate`           | 지출 목표 달성률   | `%` 유지                  |
| `goalAppliedAt`                 | `apiMeta.goalAppliedAt`                  | 적용 전략 메타정보 | ISO 날짜 유지             |
| `goalSource`                    | `apiMeta.goalSource`                     | 적용 전략 메타정보 | 문자열 유지               |

## Swagger 응답 예시

```json
{
  "achievementRate": 91.25,
  "actualDischargeDate": "2027-06-20",
  "currentAsset": 1250000,
  "deltaDaysVsActual": 97,
  "expectedAsset": 18250000,
  "financialDischargeDate": "2027-03-15",
  "goalAppliedAt": "2026-08-06T14:30:00",
  "goalSource": "SIMULATION",
  "investmentGoalAchievementRate": 84,
  "monthlyInvestmentGoal": 500000,
  "monthlySpendingGoal": 100000,
  "spendingGoalAchievementRate": 154,
  "thisMonthIncome": 1905000,
  "thisMonthInvestment": 420000,
  "thisMonthSpending": 154000
}
```

## 응답에 없는 화면 데이터

현재 `GET /api/v1/dashboard` 응답에는 아래 데이터가 없습니다. 따라서 이번 연결에서는 기존
목데이터를 유지합니다.

| 화면 데이터                     | 현재 처리     | 추후 연결 후보               |
| ------------------------------- | ------------- | ---------------------------- |
| 오늘의 리포트 문구              | 목데이터 유지 | 리포트 API 확정 필요         |
| 예정 이벤트                     | 목데이터 유지 | 이벤트 조회 API 확정 필요    |
| 오늘의 미션                     | 목데이터 유지 | `GET /api/v1/missions/today` |
| 계좌 목록·은행 아이콘           | 목데이터 유지 | 계좌 조회 API                |
| 투자 손익·보유 상품·그래프 이력 | 목데이터 유지 | 투자 상세/이력 API 확정 필요 |

서버 응답에 없는 값을 대시보드 API 응답으로 간주해 임의 접근하지 않습니다. 관련 API가
확정되면 각 기능 전용 composable에서 병렬 조회한 뒤 화면 모델에 합성합니다.

## 오류 응답

| 상태  | Swagger 설명                                | 프론트 처리                                  |
| ----- | ------------------------------------------- | -------------------------------------------- |
| `401` | 인증 필요 (`CASHFLOW_UNAUTHENTICATED`)      | 토큰 갱신을 1회 시도하고 실패 시 목 fallback |
| `403` | 접근 거부                                   | 목 fallback, `error`에 원인 보관             |
| `404` | 캐시플로우 예측 없음 (`CASHFLOW_NOT_FOUND`) | 목 fallback, `error`에 원인 보관             |

## 관련 파일

- `src/features/dashboard/api/dashboard.api.js`: HTTP 호출
- `src/features/dashboard/composables/useDashboard.js`: 조회 상태, 목 시나리오, fallback 관리
- `src/features/dashboard/mappers/dashboardResponse.mapper.js`: API 응답 → 화면 모델 변환
- `src/features/dashboard/views/DashboardView.vue`: 화면 연결
- `src/features/dashboard/mocks/dashboard.mock.js`: fallback 및 수동 테스트 시나리오
