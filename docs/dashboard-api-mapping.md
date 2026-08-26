# 대시보드 API 매핑

`/home` 대시보드의 현재 서버 연동과 화면 모델 변환 기준입니다.

## 요청 흐름

```text
DashboardView.vue
  → useDashboard()
  → dashboard.store.js
      ├─ GET /dashboard                       필수
      ├─ GET /accounts                        보조
      ├─ GET /market-reports/today            보조
      ├─ GET /missions/today                  보조
      ├─ GET /users/me                        보조
      └─ GET /transactions?startDate=&endDate= 보조
  → dashboardResponse.mapper.js
  → DashboardViewModel
```

보조 API는 `Promise.allSettled()`로 병렬 조회합니다. `/dashboard` 요청이 실패하면 전체 대시보드를 오류 상태로 전환하고, 보조 API만 실패하면 해당 영역을 빈 값으로 표시합니다.

## 인증과 서버 설정

- API 기본 경로: `VITE_API_BASE_URL` 또는 `/api/v1`
- 로컬 프록시: `vite.config.js`
- 세션 저장: `auth.session`과 호환용 `accessToken`, `refreshToken`, `userId`
- 요청 인증: `client.js`가 Access Token을 Bearer 헤더로 추가
- `401` 처리: Refresh Token으로 1회 재발급 후 원래 요청 재시도

로그인·토큰 재발급 요청에는 Bearer Token을 추가하지 않습니다. 재발급에 실패하거나 Refresh Token이 없으면 세션을 지우고 `/login`으로 이동합니다.

## `DashboardResponse` 변환

| 백엔드 필드                        | 화면 모델                                                             | 변환                                      |
| ---------------------------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| `financialDischargeDate`           | `financialDday.financialDischargeDate`, `financialDday.financialDday` | 날짜 유지, 로컬 오늘 기준 D-day 계산      |
| `actualDischargeDate`              | `financialDday.actualDischargeDate`, `financialDday.actualDday`       | 날짜 유지, 로컬 오늘 기준 D-day 계산      |
| `deltaDaysVsActual`                | `financialDday.differenceDays`                                        | 숫자 변환                                 |
| `achievementRate`                  | `financialDday.achievementRate`                                       | 퍼센트 유지                               |
| `currentAsset`                     | `financialDday.currentAsset`                                          | 원 → 만원                                 |
| `currentExpectedAsset`             | `financialDday.expectedAsset`                                         | 원 → 만원, 없으면 `currentAsset`          |
| `targetAmount`                     | `financialDday.targetAmount`                                          | 원 → 만원                                 |
| `expectedAsset`, `achievementRate` | `financialDday.targetAmount`                                          | `targetAmount`이 없을 때만 역산           |
| `thisMonthIncome`                  | `assetSummary.monthly.income.amount`                                  | 원 유지, 추후 거래 내역과 프로필로 재구성 |
| `thisMonthInvestment`              | `assetSummary.monthly.investment.amount`                              | 원 유지                                   |
| `monthlyInvestmentGoal`            | `assetSummary.monthly.investment.monthlyPaymentTarget`                | 원 유지                                   |
| `investmentGoalAchievementRate`    | `assetSummary.monthly.investment.goalAchievementRate`                 | 퍼센트 유지                               |
| `thisMonthSpending`                | `assetSummary.monthly.spending.amount`                                | 원 유지                                   |
| `monthlySpendingGoal`              | `assetSummary.monthly.spending.targetAmount`                          | 원 유지                                   |
| `spendingGoalAchievementRate`      | `assetSummary.monthly.spending.goalAchievementRate`                   | 퍼센트 유지                               |
| `currentAsset`                     | `assetSummary.total.totalAsset`                                       | 원 유지                                   |
| `expectedAsset`                    | `assetSummary.forecast.totalAmount`                                   | 원 유지                                   |
| `goalAppliedAt`, `goalSource`      | `apiMeta`                                                             | 원본 값 유지                              |

## 보조 데이터 합성

| 화면 데이터        | 출처                                 | 처리                                               |
| ------------------ | ------------------------------------ | -------------------------------------------------- |
| 계좌 목록          | `GET /accounts`                      | `accountName → name`, `balance → amount` 별칭 추가 |
| 증권계좌 연동 여부 | `GET /accounts`                      | 기관·계좌 종류로 판별                              |
| 오늘의 미션        | `GET /missions/today`                | ID, 제목, 그룹, 완료 상태 정규화                   |
| 오늘의 AI 리포트   | `GET /market-reports/today`          | `title`, `reportDate` 사용                         |
| 이번 달 추가 수입  | `GET /users/me`, `GET /transactions` | 나라사랑계좌의 급여 외 입금 합산                   |
| 예정 이벤트        | 없음                                 | 실제 사용자 모드에서 `[]`                          |

## 목 테스트 모드

- `/home`: 서버 API 사용
- `/home?persona={key}`: 해당 퍼소나 목 사용, API 미호출
- `/home?scenario={key}`: 해당 컴포넌트 시나리오 사용, API 미호출
- 둘 다 있으면 `기본 목 → persona → scenario` 순으로 합성

서버 모드에서 API가 실패해도 목데이터로 대체하지 않습니다.

## 상태·오류 계약

| `source` | 의미                              |
| -------- | --------------------------------- |
| `api`    | 필수 대시보드 API 정상 응답       |
| `mock`   | `persona` 또는 `scenario` 목 모드 |
| `error`  | 필수 대시보드 API 실패            |

`loading`, `error`, `source`, `reload()`는 `useDashboard()`가 화면에 제공합니다.

## 관련 파일

- `src/features/dashboard/api/dashboard.api.js`
- `src/features/dashboard/stores/dashboard.store.js`
- `src/features/dashboard/composables/useDashboard.js`
- `src/features/dashboard/mappers/dashboardResponse.mapper.js`
- `src/features/dashboard/mocks/dashboard.mock.js`
- `src/features/dashboard/mocks/dashboard.personas.js`
- `src/features/dashboard/views/DashboardView.vue`
