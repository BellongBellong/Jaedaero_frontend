# 대시보드 개발 가이드

대시보드의 목 시나리오, 컴포넌트별 데이터 출처, 백엔드 API 연결 계획을 관리하는 문서입니다.
대시보드 컴포넌트를 추가하거나 데이터 계약을 변경할 때 이 문서도 함께 수정합니다.

계급별 테스트 사용자와 전체 화면 전환 설계는
[`docs/dashboard-personas.md`](../../../docs/dashboard-personas.md)를 참고합니다.

## 목 시나리오 사용법

개발 서버에서 `/home?scenario={시나리오 값}`으로 접속하면 원하는 투자 상태를 바로 확인할 수 있습니다.
정의되지 않은 값은 자동으로 `default`를 사용합니다.

계급별 전체 대시보드는 `/home?persona={퍼소나 값}`으로 확인합니다.

| 퍼소나 값 | 프로필 | 테스트 URL |
| --- | --- | --- |
| `private-newcomer` | 첫 월급 전 금융 입문형 이병 | `/home?persona=private-newcomer` |
| `pfc-safe-px` | 증권계좌 없이 PX 소비가 많은 안정형 일병 | `/home?persona=pfc-safe-px` |
| `corporal-balanced-profit` | 기타 수익과 투자 수익이 있는 균형형 상병 | `/home?persona=corporal-balanced-profit` |
| `sergeant-aggressive-loss` | 투자 손실과 지출 초과가 있는 전역 임박 병장 | `/home?persona=sergeant-aggressive-loss` |

| 시나리오 값 | 확인할 화면 | 테스트 URL |
| --- | --- | --- |
| `default` | 기본 대시보드, 투자 수익 상태 | `/home?scenario=default` |
| `investment-profit` | 증권계좌가 있고 이번 달 수익이 발생한 상태 | `/home?scenario=investment-profit` |
| `investment-loss` | 증권계좌가 있고 이번 달 손실이 발생한 상태 | `/home?scenario=investment-loss` |
| `investment-steady` | 증권계좌는 있지만 이번 달 변동이 없는 상태 | `/home?scenario=investment-steady` |
| `no-investment-account` | 증권계좌를 연결하지 않은 상태 | `/home?scenario=no-investment-account` |
| `spending-over` | 지출 목표를 초과한 상태 | `/home?scenario=spending-over` |
| `spending-safe` | 지출 목표 이내로 여유가 있는 상태 | `/home?scenario=spending-safe` |
| `spending-no-target` | What-if 지출 목표가 아직 없는 상태 | `/home?scenario=spending-no-target` |

시나리오는 `mocks/dashboard.mock.js`의 `DASHBOARD_SCENARIOS`와
`dashboardMockScenarios`에서 관리합니다. 투자 기본 데이터는 다음 순서로 만들어집니다.

1. `connectedAccountResponses`에서 `accountType === 'INVESTMENT'`인 증권계좌만 선택
2. 현재 대시보드 기준 월과 같은 `investmentChangeResponses`만 선택
3. 증권계좌 잔액과 월 변동액을 각각 합산
4. 월초 금액을 기준으로 변동률 계산

증권계좌가 없는 화면을 확인할 때 목 배열을 직접 지울 필요 없이
`?scenario=no-investment-account`를 사용합니다.

## 컴포넌트와 API 연결표

현재 대시보드는 목데이터로 렌더링합니다. 아래의 “예정 API”는 백엔드 연결 시 사용할 데이터 계약이며,
명세에 없는 API는 임의로 호출하지 않습니다.

| 컴포넌트 | 표시 데이터 | 현재 목데이터 | 예정 API | 상태 |
| --- | --- | --- | --- | --- |
| `DailyReportBanner.vue` | 인사말, 금융 AI 리포트 제목, 오늘 날짜 | `dashboardResponses[].dailyBriefing` | `GET /api/v1/dashboard`의 `dailyBriefing` | 목 연결 |
| `FinancialDdayCard.vue` | 재정적 전역일, 실제 전역일, 현재 자산, 목표 달성률 | `dashboardResponses[]` | `GET /api/v1/dashboard` | 목 연결 |
| `UpcomingEventsCard.vue` | 예정 이벤트 목록과 D-day | `eventResponses` | `GET /api/v1/dashboard`의 `upcomingEvents` | 조회 목 연결, 이벤트 CRUD API 미정 |
| `TodayMissionCard.vue` | 오늘만 제공되는 `TODAY` 미션 | `missionResponses` | `GET /api/v1/missions/today` | 목 연결 |
| `MissionListSheet.vue` | 데일리 미션과 오늘의 미션 전체 | `missionResponses` | `GET /api/v1/missions/today` | 목 연결 |
| `DashboardAssetSwitcher.vue` | 이번 달 자산 현황과 나의 총 자산 전환 | `dashboardMock.assetSummary` | `GET /api/v1/dashboard`, `GET /api/v1/accounts/{userId}` | 목 연결 |
| `MonthlyAssetOverview.vue` 수입 | 이번 달 수입 합계, 복무별 월급, 기타 수입 | `soldierProfileResponse`, `transactionResponses` | `GET /api/v1/users/me`, `GET /api/v1/transactions?startDate=&endDate=` | 목 연결 |
| `MonthlyAssetOverview.vue` 투자 | 증권계좌 잔액, 이번 달 변동액·변동률, 연결 여부 | `connectedAccountResponses`, `investmentChangeResponses` | `GET /api/v1/accounts/{userId}` + 월별 증권계좌 변동 조회 API | 목 연결, 변동 조회 API 확인 필요 |
| `MonthlyAssetOverview.vue` 지출 | 이번 달 지출 합계, 지출 목표와 초과 여부 | `dashboardResponses[].assetSnapshot` | `GET /api/v1/dashboard` 또는 `GET /api/v1/transactions?startDate=&endDate=` | 목 연결 |
| `AssetAccountSummary.vue` | 총 자산과 대표 군 적금·월급 통장·투자계좌 | `connectedAccountResponses`, 퍼소나별 `assetSummary.total` | `GET /api/v1/accounts/{userId}` | 목 연결 |
| `DischargeAssetChart.vue` | 월별 예상 자산과 목표 자산 | `dashboardResponses[].assetForecast` | `GET /api/v1/cashflow?months=` | 목 연결 |

## 증권계좌 연결 동선

`no-investment-account` 시나리오에서 `증권계좌연결`을 누르면 기존 CODEF 연결 화면으로 이동합니다.

- 라우트 이름: `connect-codef-bank`
- `assetType`: `personal-assets`
- `source`: `dashboard`

현재 프로젝트에는 대시보드용 증권계좌 연결 모달이 없어서 기존 연결 화면을 재사용합니다.
추후 증권사 전용 선택 흐름이 추가되면 `assetType`과 라우트만 교체합니다.

## 컴포넌트 추가 시 문서 갱신 규칙

새 대시보드 컴포넌트를 만들 때 아래 내용을 이 문서의 연결표에 함께 추가합니다.

1. 컴포넌트 파일명
2. 화면에 필요한 데이터 필드
3. 현재 사용하는 목데이터 위치
4. 연결할 HTTP Method와 API 경로
5. 구현 상태 또는 백엔드 확인이 필요한 공백

새로운 빈 화면이나 오류 상태가 필요하면 `DASHBOARD_SCENARIOS`에 값을 추가하고 테스트 URL도 기록합니다.
