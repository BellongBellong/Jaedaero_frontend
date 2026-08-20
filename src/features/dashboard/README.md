# 대시보드 개발 가이드

대시보드의 목 시나리오, 컴포넌트별 데이터 출처, 백엔드 API 연결 계획을 관리하는 문서입니다.
대시보드 컴포넌트를 추가하거나 데이터 계약을 변경할 때 이 문서도 함께 수정합니다.

계급별 테스트 사용자와 전체 화면 전환 설계는
[`docs/dashboard-personas.md`](../../../docs/dashboard-personas.md)를 참고합니다.

실제 백엔드 응답 필드와 화면 모델의 상세 매핑은
[`docs/dashboard-api-mapping.md`](../../../docs/dashboard-api-mapping.md)를 참고합니다.

## 목 시나리오 사용법

개발 서버에서 `/home?scenario={시나리오 값}`으로 접속하면 원하는 투자 상태를 바로 확인할 수 있습니다.
정의되지 않은 값은 자동으로 `default`를 사용합니다.

계급별 전체 대시보드는 `/home?persona={퍼소나 값}`으로 확인합니다.

| 퍼소나 값                  | 프로필                                      | 테스트 URL                               |
| -------------------------- | ------------------------------------------- | ---------------------------------------- |
| `private-newcomer`         | 첫 월급 전 금융 입문형 이병                 | `/home?persona=private-newcomer`         |
| `pfc-safe-px`              | 증권계좌 없이 PX 소비가 많은 안정형 일병    | `/home?persona=pfc-safe-px`              |
| `corporal-balanced-profit` | 기타 수익과 투자 수익이 있는 균형형 상병    | `/home?persona=corporal-balanced-profit` |
| `sergeant-aggressive-loss` | 투자 손실과 지출 초과가 있는 전역 임박 병장 | `/home?persona=sergeant-aggressive-loss` |

| 시나리오 값             | 확인할 화면                                | 테스트 URL                             |
| ----------------------- | ------------------------------------------ | -------------------------------------- |
| `default`               | 기본 대시보드, 투자 수익 상태              | `/home?scenario=default`               |
| `investment-profit`     | 증권계좌가 있고 이번 달 수익이 발생한 상태 | `/home?scenario=investment-profit`     |
| `investment-loss`       | 증권계좌가 있고 이번 달 손실이 발생한 상태 | `/home?scenario=investment-loss`       |
| `investment-steady`     | 증권계좌는 있지만 이번 달 변동이 없는 상태 | `/home?scenario=investment-steady`     |
| `no-investment-account` | 증권계좌를 연결하지 않은 상태              | `/home?scenario=no-investment-account` |
| `spending-over`         | 지출 목표를 초과한 상태                    | `/home?scenario=spending-over`         |
| `spending-safe`         | 지출 목표 이내로 여유가 있는 상태          | `/home?scenario=spending-safe`         |
| `spending-no-target`    | What-if 지출 목표가 아직 없는 상태         | `/home?scenario=spending-no-target`    |

시나리오는 `mocks/dashboard.mock.js`의 `DASHBOARD_SCENARIOS`와
`dashboardMockScenarios`에서 관리합니다. 투자 기본 데이터는 다음 순서로 만들어집니다.

1. `connectedAccountResponses`에서 `accountType === 'INVESTMENT'`인 증권계좌만 선택
2. 현재 대시보드 기준 월과 같은 `investmentChangeResponses`만 선택
3. 증권계좌 잔액과 월 변동액을 각각 합산
4. 월초 금액을 기준으로 변동률 계산

증권계좌가 없는 화면을 확인할 때 목 배열을 직접 지울 필요 없이
`?scenario=no-investment-account`를 사용합니다.

## 컴포넌트와 API 연결표

일반 `/home` 화면은 `GET /api/v1/dashboard`를 조회하고, API 응답에 없는 이벤트·미션·계좌
목록은 기존 목데이터를 합성해 렌더링합니다. `persona` 또는 `scenario` 쿼리가 있으면 테스트를
위해 API를 호출하지 않고 해당 목 시나리오만 사용합니다. 명세에 없는 API는 임의로 호출하지 않습니다.

페이지 이동을 나타내는 `전체 보기`, `리포트 보기`, 총 자산 이동 버튼은 문자 화살표 대신
`src/assets/icons/arrow.svg` 에셋을 공통으로 사용합니다. 캘린더 월 이동과 헤더 뒤로가기는
각 용도에 맞는 별도 아이콘을 유지합니다.

| 컴포넌트                        | 표시 데이터                                             | 현재 목데이터                                              | 예정 API                                                                           | 상태                                   |
| ------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------- |
| `DailyReportBanner.vue`         | 인사말, 금융 AI 리포트 제목, 오늘 날짜                  | `dashboardResponses[].dailyBriefing`                       | 대시보드 응답에 필드 없음                                                          | 목 유지                                |
| `FinancialDdayCard.vue`         | 재정적 전역일, 실제 전역일, 현재 자산, 목표 달성률      | API 응답 + 목 fallback                                     | `GET /api/v1/dashboard`                                                            | API 연결                               |
| `UpcomingEventsCard.vue`        | 예정 이벤트 목록과 D-day                                | `eventResponses`                                           | `GET /api/v1/dashboard`의 `upcomingEvents`                                         | 조회 목 연결, 이벤트 CRUD API 미정     |
| `EventAddModal.vue`             | 이벤트명, 시작·종료일, 휴가 모드 자동 전환 여부         | 로컬 이벤트 상태, `localStorage` 휴가 일정                 | 이벤트 생성 API의 `startDate`, `endDate`, `autoVacationMode`                       | UI·목 저장 연결, 생성 API 미정         |
| `MiniEventCalendar.vue`         | 월간 날짜, 오늘·선택일, 이벤트 기간 표시                | `eventResponses`의 `startDate`, `endDate`                  | 예정 이벤트 조회 API                                                               | 목 연결, 별도 캘린더 API 불필요        |
| `SelectedEventList.vue`         | 선택 날짜에 포함되는 일정과 오늘 기준 D-day             | `eventResponses`                                           | 예정 이벤트 조회 API                                                               | 목 연결                                |
| `EventTimeline.vue`             | 가까운 일정순 제목·기간·D-day와 긴급도                  | `eventResponses`                                           | 예정 이벤트 조회 API                                                               | 목 연결                                |
| `TodayMilitaryBenefits.vue`     | 휴가 모드의 오늘의 군인 할인 혜택 4건 요약 및 카드 선택 | `features/benefits/mocks/benefits.mock.js`                 | 미연결                                                                             | 카드 선택·상세 이동 연결               |
| `TodayMissionCard.vue`          | 오늘만 제공되는 `TODAY` 미션                            | `missionResponses`                                         | `GET /api/v1/missions/today`                                                       | 목 연결                                |
| `MissionListSheet.vue`          | 데일리 미션과 오늘의 미션 전체                          | `missionResponses`                                         | `GET /api/v1/missions/today`                                                       | 목 연결                                |
| `DashboardAssetSwitcher.vue`    | 이번 달 자산 현황과 나의 총 자산 전환                   | API 응답 + 목 fallback                                     | `GET /api/v1/dashboard`, 계좌 조회 API                                             | 대시보드 요약 API 연결                 |
| `MonthlyAssetOverview.vue` 수입 | 이번 달 수입 합계, 복무별 월급, 기타 수입               | `soldierProfileResponse`, `transactionResponses`           | `GET /api/v1/users/me`, `GET /api/v1/transactions?startDate=&endDate=`             | 카드 선택 시 월간 입금 내역으로 이동   |
| `MonthlyAssetOverview.vue` 투자 | 증권계좌 잔액, 이번 달 변동액·변동률, 연결 여부         | `connectedAccountResponses`, `investmentChangeResponses`   | `GET /api/v1/accounts?refresh=`, `GET /api/v1/transactions/securities/{accountId}` | 실제 증권계좌 거래 API 연결            |
| `MonthlyAssetOverview.vue` 지출 | 이번 달 지출 합계, 지출 목표와 초과 여부                | `dashboardResponses[].assetSnapshot`                       | `GET /api/v1/dashboard` 또는 `GET /api/v1/transactions?startDate=&endDate=`        | 카드 선택 시 월간 출금 내역으로 이동   |
| `AssetAccountSummary.vue`       | 총 자산과 계좌·적금·투자 유형별 통합 자산               | `connectedAccountResponses`, 퍼소나별 `assetSummary.total` | `GET /api/v1/accounts/{userId}`                                                    | 목 연결                                |
| `AssetOverviewView.vue`         | 총 자산 계좌 목록과 이번 달 지출 카드                   | `assetSummary.total`, `assetSummary.monthly`               | `GET /api/v1/accounts/{userId}`, `GET /api/v1/dashboard`                           | 목 연결                                |
| `AssetAccountCard.vue`          | 총 자산, 대표 계좌 3개, 남은 계좌 수                    | `connectedAccountResponses`                                | `GET /api/v1/accounts/{userId}`                                                    | 목 연결                                |
| `AssetAccountListItem.vue`      | 은행 아이콘, 잔액, 계좌명을 표시하는 공통 계좌 행       | `connectedAccountResponses[]`                              | `GET /api/v1/accounts/{userId}`                                                    | 목 연결                                |
| `AccountAssetsView.vue`         | 입출금·저축·투자 계좌 분류와 유형별 합계                | `connectedAccountResponses`                                | `GET /api/v1/accounts/{userId}`                                                    | 목 연결                                |
| `InvestmentAssetChart.vue`      | 투자 원금·평가액·수익률과 최근 4개월 월별 수익률        | `assetSummary.monthly.investment`                          | 월별 증권계좌 수익률 조회 API                                                      | 요약 목 연결, 월별 이력 API 확인 필요  |
| `InvestmentHoldingsList.vue`    | 보유 투자 상품명·수량·평가액·수익률                     | `investmentHoldingResponses`                               | 증권계좌 보유 상품 조회 API                                                        | 목 연결, API 경로 확인 필요            |
| `AccountEditPanel.vue`          | 계좌 별칭·용도·자산 포함 여부·주 계좌 설정              | 계좌 정보와 브라우저 로컬 저장소                           | 계좌 수정 API 미제공                                                               | API 추가 전 예시 UI                    |
| `TransactionFilterSheet.vue`    | 전체·입금·출금 거래 필터 바텀시트                       | 계좌별 거래내역의 `transactionType`                        | 별도 API 없음, 조회 결과 프론트 필터                                               | 연결                                   |
| `TransactionDetailView.vue`     | 거래 항목별 적요·카테고리·유형·입출금처·일시·잔액       | 목록 API 응답 캐시 + 목 시나리오                           | `GET /api/v1/transactions`, 거래 단건 상세 조회 API                                | 목록 API 연결, 단건 API 경로 확인 필요 |
| `CategoryChangeSheet.vue`       | 현재 카테고리와 카테고리 선택·변경 바텀시트             | 거래 단건의 `category`                                     | `PUT /api/v1/transactions/{transactionId}/category`                                | UI·목 상태 연결                        |
| `DischargeAssetChart.vue`       | 월별 예상 자산과 목표 자산                              | `dashboardResponses[].assetForecast`                       | `GET /api/v1/cashflow?months=`                                                     | 목 연결                                |

## 자산 현황 화면

- 대시보드 `전체 자산 보기`에서 `/assets`로 이동합니다.
- 대시보드의 `persona`, `scenario` 쿼리를 유지해 동일한 목데이터를 표시합니다.
- 총 자산 카드에는 연결 계좌 중 앞의 3개를 표시합니다.
- 계좌가 있으면 `계좌 {전체 연동 수}개 전체 보기`, 없으면 `계좌 전체 보기`를 표시합니다.
- 계좌 보기 버튼은 `/assets/accounts`로 이동하며 기존 `AssetAccountListItem.vue`를
  상세 화면에서도 재사용합니다.
- 계좌 상세 화면의 `계좌` 탭은 입출금과 저축을 분리해 표시합니다.
  - 입출금: `CHECKING`, `SALARY`, `ACCOUNT`, `ASSET`
  - 저축: `MILITARY_SAVINGS`, `SAVINGS`, `INSTALLMENT_SAVINGS`
- `투자` 탭은 `INVESTMENT`, `SECURITIES`, `SECURITY` 유형만 표시합니다.
- 각 섹션의 금액은 해당 유형에 포함된 계좌 잔액의 합계로 계산합니다.
- 투자 그래프는 최근 4개월의 월별 수익률을 표시합니다. 최대 범위는 `50%`이며,
  실제 최고 수익률을 기준으로 세로축을 상대적으로 확대합니다. `history[]`에는
  `date`와 `rate`를 전달하며, 이력이 없으면 현재 수익률을 기준으로 임시 월별 추이를
  생성합니다. 그래프를 가리키면 월과 해당 월의 수익률을 표시합니다.
- 두 번째 카드에는 이번 달 지출 합계와 월간 수입·투자·지출 블록을 표시합니다.
- `전체 내역 보기`는 `/transactions`로 이동합니다.
- 대시보드 수입·지출 블록은 `/transactions?period=month&type=INCOME|EXPENSE`로 이동합니다.
- 대시보드 투자 블록은 `/transactions?period=month&tab=INVESTMENT`로 이동합니다.
- 거래내역 투자 탭은 `GET /api/v1/accounts`의 `accountType=SECURITIES` 또는
  `businessType=ST` 계좌를 기준으로 `GET /api/v1/transactions/securities/{accountId}`를
  조회합니다. 응답의 `DEPOSIT`은 입금, `WITHDRAW`는 출금으로 표시합니다.
- 거래내역 페이지 끝까지 스크롤하면 계좌 목록과 증권 거래 API에 `refresh=true`를 전달해
  CODEF 최신 자산 동기화를 요청하고, 완료된 결과로 목록을 다시 그립니다.
- 카드 헤더는 `AccountTitleHeader.vue`를 공통으로 사용합니다.
- 은행 아이콘은 `institutionMapping.js`에서 정규화한 기관 코드·이름을
  `bankAccountIconMapping.js`에서 `bank-account-lcon/account-list` 에셋에 연결합니다.

## 예정 이벤트 화면

대시보드의 `UpcomingEventsCard.vue`와 전체 화면인 `/upcoming-events`가 같은
`useUpcomingEvents.js` 상태를 사용합니다.

### 이벤트 데이터 계약

```json
{
  "id": 2,
  "userId": 1,
  "eventType": "VACATION",
  "title": "8월 정기휴가",
  "startDate": "2026-08-07",
  "endDate": "2026-08-10",
  "expectedExpense": 300000,
  "notificationEnabled": true,
  "autoVacationMode": true
}
```

- `startDate`, `endDate`: `YYYY-MM-DD` 형식. 단일 일정은 두 값이 같습니다.
- `autoVacationMode`: 이벤트 기간에 휴가 모드를 자동 적용할지 여부입니다.
- `dday`, `durationDays`: 화면에서 계산하는 파생 값이며 서버 저장 필드는 아닙니다.
- 목록은 오늘과 가까운 `startDate` 순으로 정렬합니다.

### 대시보드 이벤트 카드

- 최대 2개의 일정을 표시합니다.
- 일정이 3개 이상이면 `{n}개 더 보기`, 2개 이하면 `이벤트 전체 보기`를 표시합니다.
- 연속 일정은 종료일 대신 `{시작 월}월 {시작 일}일 시작`으로 표시합니다.
- 당일 일정은 `D-0` 대신 빨간 라벨의 `D-day`로 표시합니다.
- 플러스 버튼은 24px 클릭 영역 안에 14px 아이콘을 배치합니다.
- 전체 보기 클릭 시 `/upcoming-events`로 이동합니다.

### 월간 캘린더

`MiniEventCalendar.vue`는 별도의 캘린더 API 없이 이벤트 기간으로 달력을 그립니다.

- 진입 시 오늘 날짜와 현재 월을 선택합니다.
- 올해는 `8월`, 다른 연도는 `2027년 1월` 형식으로 월 제목을 표시합니다.
- `backArrowIconGreen.svg`, `nextArrowIcon.svg`로 이전·다음 달을 이동합니다.
- 다른 월로 이동하면 해당 월 1일을 선택하고 `오늘` 버튼을 표시합니다.
- `오늘` 버튼은 현재 월과 오늘 날짜로 돌아옵니다.
- 오늘 날짜 숫자는 Deep Green 원, 사용자가 선택한 날짜 셀은 `green-100` 배경으로 표시합니다.
- 이벤트 기간에 포함된 날짜는 숫자 아래에 일정 점을 표시합니다.
- 날짜는 한 번에 하나만 선택할 수 있습니다.

### 선택 날짜 일정

`SelectedEventList.vue`는 선택한 날짜가 `startDate <= selectedDate <= endDate`인 이벤트를 표시합니다.

- 제목은 `8월 15일 일정` 형식입니다.
- D-day는 선택 날짜가 아니라 실제 오늘을 기준으로 계산합니다.
- 일정 카드에는 드롭 섀도우 없이 반투명 그라데이션, 18px 블러, 유리 테두리를 적용합니다.
- 일정이 없으면 `일정이 없습니다.`와 `일정 추가` 버튼을 표시합니다.
- 빈 상태의 일정 추가 버튼은 기존 `EventAddModal.vue`를 엽니다.
- 새 이벤트를 저장하면 해당 이벤트의 시작 날짜를 자동 선택합니다.

### 일정 타임라인

`EventTimeline.vue`는 모든 예정 일정을 오늘과 가까운 순서로 보여줍니다.

- 단일 일정: `2026. 08. 01 · 금요일`
- 연속 일정: `2026. 08. 01 ~ 2026. 08. 08 (7일)`
- 마커 사이에는 위아래가 흐려지는 회색 세로 그라데이션 선을 사용합니다.
- 일정 마커에는 구간 색상과 흰색 테두리만 적용하고 초록색 외곽선은 사용하지 않습니다.

| 남은 기간      | 마커 및 D-day 라벨 |
| -------------- | ------------------ |
| `D-day`, `D-1` | Orange             |
| `D-2` ~ `D-7`  | Green              |
| `D-8` ~ `D-29` | Olive              |
| `D-30` 이상    | Gray               |

### 이벤트 추가 바텀 시트

- 이벤트명은 최대 20자입니다.
- 캘린더에서 시작일과 종료일을 선택하며 단일·연속 일정을 지원합니다.
- 일정 입력에는 `CalenderIcon.svg` 에셋을 사용합니다.
- `stateCheckBox.svg`, `stateCheckBoxTrue.svg`로 휴가 모드 자동 전환 여부를 선택합니다.
- 저장 payload에는 `title`, `startDate`, `endDate`, `durationDays`,
  `autoVacationMode`가 포함됩니다.
- 상단 핸들을 아래로 드래그하거나 배경 또는 Escape 키를 누르면 닫힙니다.

## 이벤트 기반 휴가 모드

이벤트 추가 시 `autoVacationMode`를 체크하면 이벤트의 `startDate`부터 `endDate`까지를
휴가 모드 자동 전환 기간으로 등록합니다. 이벤트는 `leave-mode` API를 통해 서버에 저장하며,
대시보드와 이벤트 전체보기에서 같은 목록을 조회합니다.

- 서버 저장 필드: `eventName`, `startDate`, `endDate`, `isLeaveModeEnabled`
- 자동 전환: 오늘이 등록 기간에 포함되면 `ModeSwitch`를 `vacation`으로 변경
- 자동 해제: 기간을 벗어나면 `military`로 변경
- 재확인 시점: 헤더 마운트, 이벤트 목록 변경, 날짜가 바뀌는 자정 직후

기존 브라우저 임시 이벤트는 첫 서버 목록 조회 시 자동으로 이전한 뒤 로컬 저장소에서 제거합니다.

## 휴가 모드 군인 혜택

휴가 모드에서는 `TodayMilitaryBenefits.vue`가 군인 혜택 API 응답 중 하루 4건을 가로 스크롤 카드로 표시합니다.

- 현재 데이터: `features/benefits/mocks/benefits.mock.js`
- 화면 필드: `id`, `title`, `category`, `discountSummary`
- 응답이 배열이거나 `data`, `benefits`, `content`, `items`로 감싸진 경우를 모두 정규화합니다.
- 선택 결과는 매일 오전 6시를 기준으로 변경되며, 같은 날짜 구간에는 새로고침해도 같은 조합을 유지합니다.
- 카테고리는 교통, 여가, 숙박, 자기계발, 기타 색상으로 매핑합니다.
- 카드를 누르면 `/benefits?benefitId={id}`로 이동해 선택한 혜택 상세 카드를 펼칩니다.
- 전체 보기 클릭 시 `/benefits`에서 카테고리별 전체 목록을 표시합니다.
- 전체 목록 카드는 클릭 시 기간, 대상, 내용, 이용 방법, 유의사항을 드롭다운으로 펼칩니다.
- 백엔드 API 연결은 보류했으며 휴가 모드 대시보드와 전체 혜택 페이지 모두 예시 데이터를 표시합니다.
- 카드 선택, 상세 카드 펼치기, 카드 혜택을 포함한 카테고리 필터와 하루 4건 선택 동작은 유지합니다.

## 증권계좌 연결 동선

`no-investment-account` 시나리오에서 `증권계좌연결`을 누르면 기존 CODEF 연결 화면으로 이동합니다.

- 라우트 이름: `connect-codef-bank`
- `assetType`: `securities` (증권사만 선택 가능한 공통 연결 모드)
- `mode`: `additional` (온보딩 단계를 진행하지 않는 추가 연동)
- `source`: 완료 후 돌아갈 화면을 결정
  - `dashboard`: 대시보드
  - `investment-assets`: 자산 현황의 투자 탭
  - `my-page`: 연결된 금융기관 관리

별도 화면을 복제하지 않고 기존 CODEF 연결 컴포넌트를 재사용합니다. `assetType=securities`이면
은행/증권 유형 선택을 생략하고 증권사만 노출하며, `source`별 완료 목적지로 돌아갑니다.

## 통합 거래 내역 화면

`TransactionHistoryView.vue`는 전체·계좌·투자 탭과 입금·출금 필터를 제공하며,
계좌 상세 화면과 동일한 `AccountTransactionItem.vue`, `TransactionFilterSheet.vue`를 재사용합니다.

- 자산 현황의 `전체 내역 보기`: 전체 거래를 표시합니다.
- 대시보드의 `이번 달 거래 내역 보기`: `period=month`로 이번 달 거래를 표시합니다.
- 대시보드 지출 현황: `period=month&type=EXPENSE`로 이번 달 출금만 표시합니다.
- 거래 선택 시 `/transactions/detail/:transactionId` 상세 화면으로 이동합니다.
- 현재 데이터: `dashboard.mock.js`의 `transactionResponses`
- 교체 API: `GET /transactions` (`period`, `type`, 자산 유형 파라미터는 백엔드 명세에 맞춰 매핑)

## 컴포넌트 추가 시 문서 갱신 규칙

새 대시보드 컴포넌트를 만들 때 아래 내용을 이 문서의 연결표에 함께 추가합니다.

1. 컴포넌트 파일명
2. 화면에 필요한 데이터 필드
3. 현재 사용하는 목데이터 위치
4. 연결할 HTTP Method와 API 경로
5. 구현 상태 또는 백엔드 확인이 필요한 공백

새로운 빈 화면이나 오류 상태가 필요하면 `DASHBOARD_SCENARIOS`에 값을 추가하고 테스트 URL도 기록합니다.
