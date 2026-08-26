# 화면 데이터 계약

현재 Vue 화면이 사용하는 라운트와 프론트엔드 정규화 모델의 기준입니다.

## 기준과 우선순위

1. 백엔드 Request·Response DTO는 백엔드 Swagger와 백엔드 `api-endpoint-mapping.md`가 기준입니다.
2. HTTP 경로와 메서드는 `docs/api-endpoint-mapping.md`와 `src/common/api/endpoints.js`를 따릅니다.
3. 이 문서는 서버 DTO를 복제하지 않고, 화면이 직접 사용하는 라운트·정규화 필드만 관리합니다.

## 공통 표기

| 표기                | 의미                                   |
| ------------------- | -------------------------------------- |
| `number`            | 금액은 별도 설명이 없으면 원(KRW) 단위 |
| `string(date)`      | `YYYY-MM-DD`                           |
| `string(date-time)` | ISO 8601 또는 서버 LocalDateTime 배열  |
| `null`              | 응답이 없거나 아직 계산되지 않음       |
| `[]`                | 데이터가 없는 목록                     |

## 현재 라운트

### 인증·온보딩

| Path                                    | Name                    | View                          | 주요 데이터                |
| --------------------------------------- | ----------------------- | ----------------------------- | -------------------------- |
| `/`                                     | `splash`                | `SplashView.vue`              | 세션 복구 상태             |
| `/login`                                | `social-login`          | `SocialLoginView.vue`         | OAuth Provider             |
| `/auth/callback/:provider`              | `social-login-callback` | `SocialLoginCallbackView.vue` | `provider`, OAuth code     |
| `/terms`                                | `terms`                 | `TermsView.vue`               | 약관 동의 상태             |
| `/onboarding`                           | `onboarding-intro`      | `OnboardingIntroView.vue`     | 온보딩 진행 상태           |
| `/onboarding/accounts`                  | `connect-accounts`      | `AccountConnectView.vue`      | 연동 계좌 목록             |
| `/onboarding/accounts/codef/:assetType` | `connect-codef-bank`    | `CodefBankConnectView.vue`    | 자산 유형·금융기관         |
| `/onboarding/nickname`                  | `nickname`              | `NicknameSetupView.vue`       | 닉네임·프로필 외형         |
| `/onboarding/military-info`             | `military-info`         | `MilitaryInfoView.vue`        | 군종·입대일·적금 가입 여부 |
| `/onboarding/preference-goal`           | `preference-goal`       | `PreferenceGoalView.vue`      | 투자 성향·목표 금액        |

### 주요 서비스

| Path                                      | Name                        | View                         | 주요 데이터               |
| ----------------------------------------- | --------------------------- | ---------------------------- | ------------------------- |
| `/home`                                   | `dashboard`                 | `DashboardView.vue`          | 대시보드 합성 모델        |
| `/notifications`                          | `notifications`             | `NotificationsView.vue`      | 알림 목록·안 읽은 수      |
| `/ai-coach`                               | `ai-coach`                  | `AiCoachView.vue`            | AI 기능 진입 상태         |
| `/challenge`                              | `challenge`                 | `ChallengeView.vue`          | 동기 그룹·미션            |
| `/mypage`                                 | `mypage`                    | `MyPageView.vue`             | 프로필·목표·뱃지          |
| `/mypage/connected-banks`                 | `connected-banks`           | `ConnectedBanksView.vue`     | 금융기관별 연동 상태      |
| `/mypage/connected-banks/:institutionKey` | `connected-bank-management` | `AccountManagementView.vue`  | 기관별 계좌·연동 상태     |
| `/transactions`                           | `transactions`              | `TransactionHistoryView.vue` | 거래 목록·필터            |
| `/transactions/detail/:transactionId`     | `transaction-detail`        | `TransactionDetailView.vue`  | 선택 거래·카테고리        |
| `/assets`                                 | `asset-overview`            | `AssetOverviewView.vue`      | 자산 요약                 |
| `/assets/accounts`                        | `account-assets`            | `AccountAssetsView.vue`      | 계좌별 자산               |
| `/monthly-asset-report`                   | `monthly-asset-report`      | `MonthlyAssetReportView.vue` | 월 수입·투자·지출         |
| `/upcoming-events`                        | `upcoming-events`           | `UpcomingEventsView.vue`     | 예정 이벤트, 현재 빈 목록 |
| `/benefits`                               | `benefits`                  | `BenefitsView.vue`           | 군인 혜택·카테고리        |
| `/badge-history`                          | `badge-history`             | `BadgeHistoryView.vue`       | 투자 뱃지 이력            |

### AI·시뮬레이션·투자

| Path                                        | Name                                 | View                              | 주요 데이터                |
| ------------------------------------------- | ------------------------------------ | --------------------------------- | -------------------------- |
| `/ai-financial-report`                      | `ai-financial-report`                | `AiFinancialReportView.vue`       | 오늘의 시장 리포트·지표    |
| `/ai-asset-analysis-result/:analysisId?`    | `ai-asset-analysis-result`           | `AiAssetAnalysisResultView.vue`   | AI 분석 상세               |
| `/analysis-history`                         | `analysis-history`                   | `AnalysisHistoryView.vue`         | What-if·AI 통합 이력       |
| `/analysis-history/what-if/:simulationId`   | `what-if-detail`                     | `WhatIfDetailView.vue`            | 시뮬레이션 상세            |
| `/what-if-simulation`                       | `what-if-simulation`                 | `WhatIfSimulationView.vue`        | What-if 기본값·실행 결과   |
| `/ai-product-recommendation`                | `ai-product-recommendation`          | `AiProductRecommendationView.vue` | 수익률 기반 상품 추천      |
| `/investment-guide`                         | `investment-guide`                   | `RebalancingView.vue`             | 최신 투자 가이드·적립 계획 |
| `/investment-guide/plan/new`                | `investment-plan-create`             | `RecurringInvestmentPlanView.vue` | 적립 계획 생성             |
| `/investment-guide/plan/edit`               | `investment-plan-edit`               | `RecurringInvestmentPlanView.vue` | 적립 계획 수정             |
| `/investment-guide/plan/connect-securities` | `investment-plan-connect-securities` | `CodefBankConnectView.vue`        | 증권사 연동                |
| `/investment-guide/result`                  | `investment-guide-result`            | `InvestmentGuideResultView.vue`   | 새 투자 가이드             |
| `/investment-guide/detail/:guidanceId`      | `investment-guide-detail`            | `InvestmentGuideDetailView.vue`   | 투자 가이드 상세·적용      |

`/rebalancing`은 `investment-guide`로 redirect합니다. 위 표에 없는 View 파일은 현재 Router에 등록되지 않은 보조 화면입니다.

## 정규화 모델

### `AuthSession`

| 필드                   | 타입             | 설명               |
| ---------------------- | ---------------- | ------------------ |
| `accessToken`          | `string \| null` | API Bearer Token   |
| `refreshToken`         | `string \| null` | 토큰 재발급에 사용 |
| `expiresIn`            | `number`         | 초 단위 만료 기간  |
| `accessTokenExpiresAt` | `number`         | epoch millisecond  |
| `user`                 | `object \| null` | 로그인 사용자 요약 |

`auth.storage.js`는 `auth.session`을 기본으로 사용하고 기존 `accessToken`, `refreshToken`, `userId` 키와 호환을 유지합니다.

### `AccountViewModel`

| 필드                          | 타입               | 정규화                                     |
| ----------------------------- | ------------------ | ------------------------------------------ |
| `accountId`, `id`             | `number \| string` | `accountId` 또는 `id`                      |
| `accountName`                 | `string`           | 계좌·상품·별칭 순으로 선택                 |
| `organizationCode`            | `string`           | 기관 매핑 결과                             |
| `institutionName`, `bankName` | `string`           | 기관 표시명                                |
| `accountNumberMasked`         | `string`           | `accountMasked` 또는 `accountNumberMasked` |
| `balance`, `amount`           | `number`           | `currentBalance` 또는 `balance`            |
| `accountStatus`               | `string`           | 서버 상태, 로컬 해제 상태는 `DISCONNECTED` |

### `DashboardViewModel`

| 필드                    | 타입                            | 설명                               |
| ----------------------- | ------------------------------- | ---------------------------------- |
| `response`              | `object`                        | 원본 `DashboardResponse`           |
| `dailyReport`           | `{ title, date }`               | 시장 리포트 요약                   |
| `financialDday`         | `object`                        | 재정적·실제 전역 D-day, 자산, 목표 |
| `missions`              | `object[]`                      | 오늘의 미션 정규화 목록            |
| `events`                | `object[]`                      | 현재 서버 모드에서 `[]`            |
| `assetSummary.monthly`  | `object`                        | 수입·투자·지출                     |
| `assetSummary.total`    | `object`                        | 총자산·계좌                        |
| `assetSummary.forecast` | `object`                        | 전역 예상 자산·차트                |
| `apiMeta`               | `{ goalAppliedAt, goalSource }` | 적용 전략 메타 정보                |

세부 변환은 `docs/dashboard-api-mapping.md`를 따릅니다.

### `TransactionViewModel`

| 필드                  | 타입                | 정규화                                               |
| --------------------- | ------------------- | ---------------------------------------------------- |
| `id`, `transactionId` | `number \| string`  | `transactionId` 또는 `id`                            |
| `accountId`           | `number \| string`  | 서버 값 유지                                         |
| `merchantName`        | `string`            | `merchantName → description → title` 순으로 선택     |
| `amount`              | `number`            | 원 단위                                              |
| `transactionType`     | `INCOME \| EXPENSE` | `DEPOSIT → INCOME`, `WITHDRAW\|WITHDRAWAL → EXPENSE` |
| `category`            | `string`            | 카테고리 코드                                        |
| `transactionDate`     | `string(date-time)` | `transactionAt` 또는 `transactionDate` 정규화        |

날짜 배열·객체 응답도 `YYYY-MM-DDTHH:mm:ss` 문자열로 변환합니다.

### `AnalysisHistoryCard`

| 필드               | 타입                     | 설명                                  |
| ------------------ | ------------------------ | ------------------------------------- |
| `id`               | `string`                 | `ai-{sourceId}` 또는 `sim-{sourceId}` |
| `sourceId`         | `number \| string`       | 원본 분석·시뮬레이션 ID               |
| `type`             | `AI_ANALYSIS \| WHAT_IF` | 카드 유형                             |
| `title`            | `string`                 | 사용자 표시 제목                      |
| `date`, `sortKey`  | `string`                 | 표시용 날짜·정렬 원본                 |
| `summary`          | `string`                 | 분석 요약                             |
| `applied`          | `boolean`                | 전략 적용 여부                        |
| `metrics`          | `object[]`               | 소비·예상 자산 지표                   |
| `allocationRatios` | `object[] \| undefined`  | What-if 배분 비율                     |
| `projectedAsset`   | `string`                 | 만원 단위 표시값                      |

통합 이력 응답은 `records`, `totalCount`, `hasNext`, `latestDate`, `latestProjectedAsset`로 변환합니다.

### `WhatIfDetailViewModel`

| 그룹      | 필드                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------ |
| 식별·요약 | `id`, `title`, `saved`, `projectedAsset`, `targetAmount`, `targetReturnRate`, `financialDischargeDate` |
| 계산 검증 | `hasCalculationDetail`, `calculationStatus`, `calculationPolicyVersion`                                |
| 계산 내역 | `calculationRows`, `benefitRows`, `principalRows`                                                      |
| 월 배분   | `baseSalary`, `allocations`, `payments`                                                                |

배분은 투자·군적금·소비·미배분으로 표시하고, 미배분 금액은 0 미만으로 내려가지 않게 보정합니다.

### `ProductRecommendationCard`

| 필드                      | 타입               | 설명                   |
| ------------------------- | ------------------ | ---------------------- |
| `id`                      | `number \| string` | 상품·ETF 식별자        |
| `productName`, `provider` | `string`           | 표시명·제공사          |
| `expectedReturnRate`      | `number \| null`   | 최근 1년 수익률 우선   |
| `riskLabel`               | `string`           | 위험 등급 한글 표시    |
| `reason`                  | `string`           | 추천 근거              |
| `rateText`, `rateLabel`   | `string`           | 수익률 표시            |
| `previewTags`             | `string[]`         | 최대 2개 미리보기 태그 |
| `themeClass`, `emoji`     | `string`           | 카드 표현              |

개인화 추천이 있으면 우선 사용하고, 없으면 투자 성향과 추천 가능 조건을 만족하는 상품을 사용합니다.

### `NotificationViewModel`

| 필드               | 타입                | 정규화                         |
| ------------------ | ------------------- | ------------------------------ |
| `notificationId`   | `number \| string`  | `notificationId` 또는 `id`     |
| `notificationType` | `string`            | `notificationType` 또는 `type` |
| `title`            | `string`            | 알림 제목                      |
| `body`             | `string`            | `body` 또는 `message`          |
| `read`             | `boolean`           | `read` 또는 `isRead`           |
| `createdAt`        | `string(date-time)` | 생성 시각                      |

목록 상태는 `page`, `hasNext`, `totalElements`, `unreadCount`를 포함합니다. 푸시 권한 상태는 `granted`, `denied`, `default`, `disabled`, `unsupported` 중 하나입니다.

### `MarketIndicatorRow`

| 필드     | 타입                              | 설명                              |
| -------- | --------------------------------- | --------------------------------- |
| `label`  | `string`                          | 코스피·코스닥·미국채 10년·원/달러 |
| `value`  | `string`                          | 단위가 포함된 표시값              |
| `change` | `string`                          | 등락값·등락률                     |
| `tone`   | `positive \| negative \| neutral` | 색상 상태                         |

지원하지 않는 지표 코드는 화면 목록에서 제외합니다.

## 서버 응답을 그대로 사용하는 영역

| 영역                  | Store·API                                    | 비고                          |
| --------------------- | -------------------------------------------- | ----------------------------- |
| 온보딩                | `onboarding.store.js`, `onboarding.api.js`   | 입력 단계 상태만 Store에 보관 |
| 챌린지·미션           | `challenge.store.js`, `mission.store.js`     | 목록 래핑만 해제              |
| 전역 리포트·혜택      | `reports.store.js`, `reports.api.js`         | 응답 유지                     |
| 장병내일준비적금      | `soldierSavings.api.js`                      | 응답 유지                     |
| 휴가모드              | `leave-mode.store.js`, `leaveMode.api.js`    | `204` 현재 모드 없음 처리     |
| 투자 가이드·적립 계획 | `rebalancing.store.js`, `rebalancing.api.js` | 응답 유지                     |
| 마이페이지·목표       | `my-page.store.js`, `myPage.api.js`          | 사용자·목표 응답 유지         |

이 영역에 화면 전용 변환이 필요해지면 현재 Store에 최소 변환을 추가하거나 복잡할 때만 Mapper를 분리합니다.

## 변경 규칙

1. 백엔드 DTO·엔드포인트 변경을 먼저 확인합니다.
2. `src/common/api/endpoints.js`와 해당 Feature API를 수정합니다.
3. 정규화 모델이 바뀌면 Mapper·Store·View와 이 문서를 함께 수정합니다.
4. 라운트가 바뀌면 Router와 이 문서의 라운트 표를 함께 수정합니다.
5. 응답에 없는 값을 임의로 만들어 화면에 노출하지 않습니다.
