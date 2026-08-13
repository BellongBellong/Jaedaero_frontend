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
  → GET /api/v1/dashboard + missions/today + accounts + market-reports/today
  → dashboardResponse.mapper.js
  → 기존 대시보드 화면 모델
```

온보딩 완료 흐름은 다음 순서를 보장합니다.

```text
투자 성향·목표 저장
  → POST /api/v1/cashflow
  → 캐시플로우 생성 성공
  → /home 이동
  → GET /api/v1/dashboard
```

- `/home`: 백엔드 API를 조회합니다.
- `/home?persona=...` 또는 `/home?scenario=...`: 화면 상태 테스트를 위해 목데이터만 사용합니다.
- API가 실패하면 목데이터로 대체하지 않고 오류 메시지와 `다시 시도` 버튼을 표시합니다.
  실패 원인은 `useDashboard()`의 `error`, 현재 데이터 출처는 `source`에서 확인할 수 있습니다.
- 실제 사용자 화면의 예정 이벤트는 현재 빈 상태로 표시합니다. 배포 Swagger에 이벤트 조회·등록
  API가 없으므로 DB 연동은 백엔드 이벤트 API가 추가된 뒤 진행해야 합니다.

## 응답 필드 매핑

| 백엔드 응답                     | 프론트 화면 모델                         | 사용 화면          | 변환                      |
| ------------------------------- | ---------------------------------------- | ------------------ | ------------------------- |
| `financialDischargeDate`        | `financialDday.financialDischargeDate`   | 재정적 전역일      | 날짜 유지                 |
| `actualDischargeDate`           | `financialDday.actualDischargeDate`      | 실제 전역일        | 날짜 유지                 |
| 두 전역일 날짜                  | `financialDday`, `actualDday`            | D-day              | 로컬 오늘의 날짜와 UTC 날짜값으로 계산 |
| `deltaDaysVsActual`             | `financialDday.differenceDays`           | 빠름·느림 안내 문구 | 백엔드 계산값을 그대로 사용 |
| `currentAsset`                  | `financialDday.currentAsset`             | 순자산·말풍선      | 원 → 만원                 |
| `currentAsset`                  | `assetSummary.total.totalAsset`          | 총 자산            | 원 유지                   |
| `expectedAsset`                 | `assetSummary.forecast.totalAmount`      | 전역 예상 자산     | 원 유지                   |
| `achievementRate`               | `financialDday.achievementRate`          | 목표 달성률        | `%` 유지                  |
| `expectedAsset` / `achievementRate` | `financialDday.targetAmount`          | 목표 금액          | `예상 자산 ÷ 달성률`로 역산, 원 → 만원 |
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
| `401` | 인증 필요 (`CASHFLOW_UNAUTHENTICATED`)      | 토큰 갱신을 1회 시도하고 실패 시 로그인 이동 |
| `403` | 접근 거부                                   | 오류 상태 표시                              |
| `404` | 캐시플로우 예측 없음 (`CASHFLOW_NOT_FOUND`) | 오류 상태 표시                              |

실제 사용자 모드에서는 API 실패 시 목데이터를 노출하지 않습니다. 목데이터는
`persona` 또는 `scenario` 쿼리가 있는 명시적 화면 테스트에서만 사용합니다.

## 관련 파일

- `src/features/dashboard/api/dashboard.api.js`: HTTP 호출
- `src/features/dashboard/composables/useDashboard.js`: 조회 상태, 목 시나리오, fallback 관리
- `src/features/dashboard/mappers/dashboardResponse.mapper.js`: API 응답 → 화면 모델 변환
- `src/features/dashboard/views/DashboardView.vue`: 화면 연결
- `src/features/dashboard/mocks/dashboard.mock.js`: fallback 및 수동 테스트 시나리오

## 캐시플로우 API

- 요청: `GET /api/v1/cashflow?months={개월 수}`
- 인증: `Authorization: Bearer {accessToken}` 및 개발용 `X-User-Id`
- 화면 연결: What-if 시뮬레이션의 월별 예상 급여
- 주요 응답 필드: `months[].expectedSalary`, `months[].expectedSavingAmount`,
  `months[].expectedSpendingAmount`, `months[].expectedInvestmentAmount`,
  `months[].expectedEndingAsset`

운영 서버는 `X-User-Id`만 보낸 요청도 `CASHFLOW_UNAUTHENTICATED`로 거절합니다. 따라서 먼저
로그인해 `localStorage.accessToken`이 저장되어 있어야 하며, 공통 API 클라이언트가 Bearer 토큰을
자동으로 첨부합니다.

## 거래내역 API

- 요청: `GET /api/v1/transactions`
- 선택 쿼리: `accountId`, `category`, `startDate`, `endDate`
- 인증: `Authorization: Bearer {accessToken}` 및 개발용 `X-User-Id`
- 화면 연결: 전체 거래내역, 계좌별 거래내역, 거래 상세

| 백엔드 응답     | 화면 모델         | 변환                       |
| --------------- | ----------------- | -------------------------- |
| `transactionId` | `id`              | 상세 페이지 이동 키로 사용 |
| `transactionAt` | `transactionDate` | 기존 날짜 포맷터와 호환    |
| `description`   | `merchantName`    | 거래처/거래명으로 표시     |
| `DEPOSIT`       | `INCOME`          | 입금 필터 및 초록 금액     |
| `WITHDRAWAL`    | `EXPENSE`         | 출금 필터 및 일반 금액     |

`type`과 `tab`은 서버가 지원하는 조회 파라미터가 아니므로 API 응답을 받은 뒤 화면에서
필터링합니다. `period=month` 진입 시에는 현재 달의 시작일과 종료일을 `startDate`, `endDate`로
전달합니다. 퍼소나·시나리오 쿼리가 있을 때는 의도적으로 목데이터를 사용합니다.
