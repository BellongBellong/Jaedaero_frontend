# 화면별 데이터 타입 명세서

Vue 3 + JavaScript 프론트엔드에서 사용하는 화면 데이터 계약입니다. TypeScript를 사용하지 않으므로, 이 문서를 DTO와 목데이터의 기준으로 사용합니다.

## 공통 표기 규칙

| 표기                | 의미                                                 |
| ------------------- | ---------------------------------------------------- |
| `number`            | 금액은 원 단위 정수, 비율은 별도 설명이 없으면 0~100 |
| `string(date)`      | `YYYY-MM-DD`                                         |
| `string(date-time)` | ISO 8601                                             |
| `enum`              | 정해진 문자열만 허용                                 |
| `null`              | 응답이 없거나 아직 계산되지 않은 값                  |
| 배열                | `Type[]` 형식으로 표기                               |

## 공통 Enum

| Enum                       | 값                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `SocialType`               | `GOOGLE`, `KAKAO`                                                                            |
| `SoldierType`              | `ARMY`, `NAVY`, `AIR_FORCE`, `MARINE`                                                        |
| `InvestmentType`           | `SAFE`, `BALANCED`, `AGGRESSIVE`                                                             |
| `InvestmentPreferenceType` | `SAFE`, `BALANCED`, `AGGRESSIVE`                                                             |
| `MarketCondition`          | `RISK_ON`, `NEUTRAL`, `RISK_OFF`                                                             |
| `DeviceType`               | `WEB`, `ANDROID`, `IOS`                                                                      |
| `GoalStatus`               | `NORMAL`, `CHALLENGING`, `UNREALISTIC`, `ACHIEVED`                                           |
| `CodefConnectionStatus`    | `PENDING`, `CONNECTED`, `FAILED`                                                             |
| `AccountStatus`            | `ACTIVE`, `SYNC_REQUIRED`, `ERROR`, `DISCONNECTED`                                           |
| `AccountRole`              | `MILITARY_SAVINGS`, `CHECKING`, `SAVINGS`, `INVESTMENT`                                      |
| `TransactionType`          | `INCOME`, `EXPENSE`, `ASSET_TRANSFER`                                                        |
| `CategorySourceType`       | `RULE`, `AI`, `USER`                                                                         |
| `AnalysisType`             | `SIMULATION`, `CASHFLOW`, `SPENDING`                                                         |
| `ProductStatus`            | `AVAILABLE`, `SUSPENDED`, `ENDED`                                                            |
| `StrategySourceType`       | `AI_ANALYSIS`, `REBALANCING`                                                                 |
| `RecommendedTarget`        | `MONTHLY_SPENDING`, `MONTHLY_SAVING`, `MONTHLY_INVESTMENT`, `VACATION_BUDGET`, `ASSET_RATIO` |

---

## 1. 소셜 로그인 화면

- 화면 ID: `AUTH_01_LOGIN`
- Route: `/login`
- API: `POST /api/v1/auth/login`
- Request DTO: `LoginRequest`
- Response DTO: `LoginResponse`

### LoginRequest

| 필드                | 타입         | 필수 | 설명                            |
| ------------------- | ------------ | ---: | ------------------------------- |
| `socialType`        | `SocialType` |    O | Google 또는 Kakao               |
| `authorizationCode` | `string`     |    O | 소셜 인증 완료 후 전달받은 코드 |
| `redirectUri`       | `string`     |    O | 로그인 콜백 주소                |

### LoginResponse

| 필드                       | 타입         | 필수 | 설명                                   |
| -------------------------- | ------------ | ---: | -------------------------------------- |
| `accessToken`              | `string`     |    O | 목 서버에서는 고정 토큰                |
| `refreshToken`             | `string`     |    O | 실제 운영 저장 방식은 백엔드 정책 확인 |
| `expiresIn`                | `number`     |    O | 초 단위                                |
| `user.userId`              | `number`     |    O | 사용자 ID                              |
| `user.nickname`            | `string`     |    O | 닉네임                                 |
| `user.socialType`          | `SocialType` |    O | 로그인 제공자                          |
| `user.onboardingCompleted` | `boolean`    |    O | 온보딩 완료 여부                       |

```json
{
  "accessToken": "mock-access-token",
  "refreshToken": "mock-refresh-token",
  "expiresIn": 1800,
  "user": {
    "userId": 1,
    "nickname": "도헌",
    "socialType": "GOOGLE",
    "onboardingCompleted": true
  }
}
```

## 2. 프로필 설정 화면

- 화면 ID: `ONB_01_PROFILE`
- Route: `/onboarding/profile`
- API: 닉네임 중복확인, 닉네임 변경, 프로필 외형 변경

### NicknameAvailabilityResponse

| 필드        | 타입      | 필수 | 설명           |
| ----------- | --------- | ---: | -------------- |
| `nickname`  | `string`  |    O | 확인한 닉네임  |
| `available` | `boolean` |    O | 사용 가능 여부 |

### NicknameRequest

| 필드       | 타입     | 필수 | 제약   |
| ---------- | -------- | ---: | ------ |
| `nickname` | `string` |    O | 2~12자 |

### ProfileAppearanceRequest

| 필드                     | 타입     | 필수 | 설명               |
| ------------------------ | -------- | ---: | ------------------ |
| `profileImage`           | `string` |    O | 프리셋 이미지 코드 |
| `profileBackgroundColor` | `string` |    O | `#RRGGBB`          |
| `profileSource`          | `enum`   |    O | `GREEN`, `OLIVE`, `YELLOW`, `ORANGE`, `GRAY`, `BLACK` |

## 3. 약관 동의 화면

- 화면 ID: `ONB_02_AGREEMENT`
- Route: `/onboarding/agreement`
- API: `POST /api/v1/agreements`

### UserAgreementRequest / UserAgreementResponse

| 필드        | 타입                | 필수 | 설명           |
| ----------- | ------------------- | ---: | -------------- |
| `termsCode` | `string`            |    O | 약관 코드      |
| `agreed`    | `boolean`           |    O | 동의 여부      |
| `agreedAt`  | `string(date-time)` | 응답 | 동의 처리 시각 |

## 4. 군 정보 입력 화면

- 화면 ID: `ONB_03_MILITARY_INFO`
- Route: `/onboarding/military-info`
- API: `POST /api/v1/onboarding/military-info`
- Request: `MilitaryInfoRequest`
- Response: `SoldierProfileResponse`

| 필드                                | 타입           | 필수 | 설명                         |
| ----------------------------------- | -------------- | ---: | ---------------------------- |
| `soldierType`                       | `SoldierType`  |    O | 군종                         |
| `rankName`                          | `string`       |    O | 현재 계급                    |
| `enlistmentDate`                    | `string(date)` |    O | 입대일                       |
| `success`                           | `boolean`      | 응답 | 저장 성공 여부               |
| `dischargeDate`                     | `string(date)` | 응답 | 전역 예정일                  |
| `savingJoinYn`                      | `boolean`      | 응답 | 군적금 가입 여부             |
| `challengeGroupTargetAmountAverage` | `number`       | 응답 | 입대 동기 그룹 평균 목표금액 |

## 5. 초기 투자성향 프리뷰 화면

- 화면 ID: `ONB_04_INVESTMENT_PREFERENCE`
- Route: `/onboarding/investment-preference`
- API: `POST /api/v1/onboarding/investment-preference`

### InvestmentPreferenceRequest

| 필드                   | 타입                       | 필수 |
| ---------------------- | -------------------------- | ---: |
| `investmentPreference` | `InvestmentPreferenceType` |    O |

### InvestmentPreferencePreviewResponse

| 필드                                | 타입                       | 필수 | 설명                        |
| ----------------------------------- | -------------------------- | ---: | --------------------------- |
| `investmentPreference`              | `InvestmentPreferenceType` |    O | 뱃지 해금 전 임시 추천 기준 |
| `title`                             | `string`                   |    O | 프리뷰 제목                 |
| `summary`                           | `string`                   |    O | 추천 성격 설명              |
| `recommendedAssetRatio.safeAsset`   | `number`                   |    O | 안전자산 비중               |
| `recommendedAssetRatio.growthAsset` | `number`                   |    O | 성장자산 비중               |

## 6. 목표 설정 화면

- 화면 ID: `ONB_05_GOAL`
- Route: `/onboarding/goal`
- API: `POST /api/v1/goals`, `GET /api/v1/goals`

### GoalRequest / GoalResponse

| 필드                         | 타입             | 필수 | 설명                       |
| ---------------------------- | ---------------- | ---: | -------------------------- |
| `targetAmount`               | `number`         |    O | 목표 금액                  |
| `targetDate`                 | `string(date)`   |    O | 기본값은 전역일            |
| `goalStatus`                 | `GoalStatus`     | 응답 | 목표 난이도 또는 달성 상태 |
| `estimatedAmountAtDischarge` | `number`         | 응답 | 전역 예상 자산             |
| `warningMessage`             | `string \| null` | 응답 | 목표가 높을 때 경고        |

## 7. CODEF 계좌 연동 화면

- 화면 ID: `ONB_06_ACCOUNT_CONNECT`
- Route: `/onboarding/accounts`
- API: `POST /api/v1/accounts/connect`, `GET /api/v1/accounts`

### AccountConnectRequest

| 필드               | 타입          | 필수 | 설명                  |
| ------------------ | ------------- | ---: | --------------------- |
| `organizationCode` | `string`      |    O | 금융기관 코드         |
| `accountRole`      | `AccountRole` |    O | 군적금/입출금/투자 등 |
| `isPrimary`        | `boolean`     |    O | 대표 계좌 여부        |

### CodefConnectionResponse

| 필드                    | 타입                    | 필수 |
| ----------------------- | ----------------------- | ---: |
| `connectionId`          | `string`                |    O |
| `status`                | `CodefConnectionStatus` |    O |
| `connectedAccountCount` | `number`                |    O |
| `connectedAt`           | `string(date-time)`     |    O |

### ConnectedAccountResponse

| 필드                  | 타입                | 필수 | 설명               |
| --------------------- | ------------------- | ---: | ------------------ |
| `id`                  | `number`            |    O | 계좌 ID            |
| `organizationCode`    | `string`            |    O | CODEF 금융기관 코드 |
| `institutionName`     | `string`            |    O | 금융기관 표시명     |
| `bankName`            | `string`            |    O | 금융기관명         |
| `accountName`         | `string`            |    O | 계좌명             |
| `accountNumberMasked` | `string`            |    O | 마스킹 번호        |
| `accountRole`         | `AccountRole`       |    O | 계좌 역할          |
| `accountStatus`       | `AccountStatus`     |    O | 동기화 상태 포함   |
| `balance`             | `number`            |    O | 잔액               |
| `monthlyPayment`      | `number`            |    O | 월 납입액          |
| `lastSyncedAt`        | `string(date-time)` |    O | 마지막 동기화 시각 |

## 8. 홈 대시보드

- 화면 ID: `HOME_01_DASHBOARD`
- Route: `/home`
- API: `GET /api/v1/dashboard`
- Response: `DashboardResponse`

| 필드                               | 타입                    | 필수 | 화면 사용처                 |
| ---------------------------------- | ----------------------- | ---: | --------------------------- |
| `asOf`                             | `string(date-time)`     |    O | 데이터 기준시각             |
| `nickname`                         | `string`                |    O | 헤더                        |
| `rank`                             | `string`                |    O | 헤더                        |
| `dischargeDday`                    | `number`                |    O | D-day                       |
| `totalAsset`                       | `number`                |    O | 총자산 카드                 |
| `monthlyAssetChange`               | `number`                |    O | 전월 대비                   |
| `targetAmount`                     | `number`                |    O | 목표 카드                   |
| `goalAchievementRate`              | `number`                |    O | 목표 달성률                 |
| `remainingTargetAmount`            | `number`                |    O | 남은 목표 금액              |
| `actualDischargeDate`              | `string(date)`          |    O | 실제 전역일                 |
| `financialDischargeDate`           | `string(date) \| null`  |    O | 재정적 전역일               |
| `financialDischargeDifferenceDays` | `number \| null`        |    O | 날짜 차이                   |
| `projectedAssetAtDischarge`        | `number`                |    O | 전역 예상 자산              |
| `assetSnapshot`                    | `AssetSnapshotResponse` |    O | 자산 구성                   |
| `dailyBriefing`                    | `object`                |    O | 이벤트형 브리핑             |
| `todayMission`                     | `object \| null`        |    O | 오늘의 미션                 |
| `upcomingEvents`                   | `object[]`              |    O | 예정 이벤트, 현재 읽기 전용 |

## 9. 월별 캐시플로우 화면

- 화면 ID: `HOME_02_CASHFLOW`
- Route: `/cashflow`
- API: `GET /api/v1/cashflow?months=`
- Response: `CashflowForecastResponse`

### CashflowForecastResponse

| 필드                        | 타입                              | 필수 |
| --------------------------- | --------------------------------- | ---: |
| `baseDate`                  | `string(date)`                    |    O |
| `requestedMonths`           | `number`                          |    O |
| `currentAsset`              | `number`                          |    O |
| `projectedAssetAtDischarge` | `number`                          |    O |
| `targetAmount`              | `number`                          |    O |
| `shortfallAmount`           | `number`                          |    O |
| `financialDischargeDate`    | `string(date) \| null`            |    O |
| `actualDischargeDate`       | `string(date)`                    |    O |
| `months`                    | `CashflowForecastMonthResponse[]` |    O |

### CashflowForecastMonthResponse

| 필드                | 타입              | 필수 |
| ------------------- | ----------------- | ---: |
| `month`             | `string(YYYY-MM)` |    O |
| `income`            | `number`          |    O |
| `spending`          | `number`          |    O |
| `saving`            | `number`          |    O |
| `investment`        | `number`          |    O |
| `eventExpense`      | `number`          |    O |
| `governmentSupport` | `number`          |    O |
| `endingAsset`       | `number`          |    O |

## 10. What-if 시뮬레이션 화면

- 화면 ID: `AI_01_SIMULATION`
- Route: `/ai-coach/simulations`
- API: `POST /api/v1/simulations`, `GET /api/v1/simulations`, `GET /api/v1/simulations/{simulationId}`

### SimulationRequest

| 필드                      | 타입     | 필수 |
| ------------------------- | -------- | ---: |
| `name`                    | `string` |    O |
| `monthlySpendingAmount`   | `number` |    O |
| `monthlySavingAmount`     | `number` |    O |
| `monthlyInvestmentAmount` | `number` |    O |
| `annualReturnRate`        | `number` |    O |
| `vacationBudget`          | `number` |    O |
| `targetAmount`            | `number` |    O |

### SimulationResponse 추가 필드

| 필드                        | 타입                   | 필수 |
| --------------------------- | ---------------------- | ---: |
| `id`                        | `number`               |    O |
| `projectedAssetAtDischarge` | `number`               |    O |
| `financialDischargeDate`    | `string(date) \| null` |    O |
| `differenceFromCurrent`     | `number`               |    O |
| `createdAt`                 | `string(date-time)`    |    O |

## 11. AI 분석 화면

- 화면 ID: `AI_02_ANALYSIS`
- Route: `/ai-coach/analyses/:analysisId`
- API: AI 분석 생성·상세·전략 적용·적용 이력

### AiAnalysisRequest

| 필드           | 타입             | 필수 |
| -------------- | ---------------- | ---: |
| `simulationId` | `number \| null` |    X |
| `analysisType` | `AnalysisType`   |    O |

### AiAnalysisResponse

| 필드                   | 타입                              | 필수 |
| ---------------------- | --------------------------------- | ---: |
| `id`                   | `number`                          |    O |
| `simulationId`         | `number \| null`                  |    O |
| `analysisType`         | `AnalysisType`                    |    O |
| `summary`              | `string`                          |    O |
| `causes`               | `object[]`                        |    O |
| `recommendedScenarios` | `AiRecommendedScenarioResponse[]` |    O |
| `warnings`             | `string[]`                        |    O |
| `generatedAt`          | `string(date-time)`               |    O |

### AiRecommendedScenarioResponse

| 필드                   | 타입                    | 필수 |
| ---------------------- | ----------------------- | ---: |
| `scenarioId`           | `number`                |    O |
| `title`                | `string`                |    O |
| `recommendedTarget`    | `RecommendedTarget`     |    O |
| `expectedEffectAmount` | `number`                |    O |
| `priority`             | `HIGH \| MEDIUM \| LOW` |    O |

### StrategyApplicationResponse

| 필드            | 타입                 | 필수 |
| --------------- | -------------------- | ---: |
| `id`            | `number`             |    O |
| `sourceType`    | `StrategySourceType` |    O |
| `sourceId`      | `number`             |    O |
| `appliedTarget` | `RecommendedTarget`  |    O |
| `beforeValue`   | `number`             |    O |
| `afterValue`    | `number`             |    O |
| `appliedAt`     | `string(date-time)`  |    O |

## 12. 거래내역 화면

- 화면 ID: `ASSET_01_TRANSACTIONS`
- Route: `/transactions`
- API: 조회, 카테고리 수정

### TransactionSearchRequest

| 필드        | 타입                   | 필수 |
| ----------- | ---------------------- | ---: |
| `accountId` | `number \| null`       |    X |
| `startDate` | `string(date) \| null` |    X |
| `endDate`   | `string(date) \| null` |    X |
| `category`  | `string \| null`       |    X |

### TransactionResponse

| 필드                       | 타입                 | 필수 |
| -------------------------- | -------------------- | ---: |
| `id`                       | `number`             |    O |
| `accountId`                | `number`             |    O |
| `merchantName`             | `string`             |    O |
| `amount`                   | `number`             |    O |
| `transactionType`          | `TransactionType`    |    O |
| `category`                 | `string`             |    O |
| `categorySourceType`       | `CategorySourceType` |    O |
| `classificationConfidence` | `number`             |    O |
| `transactionDate`          | `string(date-time)`  |    O |

### TransactionCategoryUpdateRequest

| 필드       | 타입     | 필수 |
| ---------- | -------- | ---: |
| `category` | `string` |    O |

## 13. 장병내일준비적금 화면

- 화면 ID: `ASSET_02_SOLDIER_SAVING`
- Route: `/soldier-savings`
- API: `GET /api/v1/soldier-savings`

| 필드                      | 타입            | 필수 |
| ------------------------- | --------------- | ---: |
| `bankName`                | `string`        |    O |
| `productName`             | `string`        |    O |
| `monthlyPayment`          | `number`        |    O |
| `paidMonthCount`          | `number`        |    O |
| `totalPaidAmount`         | `number`        |    O |
| `maturityDate`            | `string(date)`  |    O |
| `estimatedMaturityAmount` | `number`        |    O |
| `governmentSupportAmount` | `number`        |    O |
| `accountStatus`           | `AccountStatus` |    O |

## 14. 동기 그룹·랭킹 화면

- 화면 ID: `CHALLENGE_01_GROUP`
- Route: `/challenges`
- API: `GET /api/v1/challenges/group`

### ChallengeGroupResponse

| 필드               | 타입                             | 필수 |
| ------------------ | -------------------------------- | ---: |
| `groupName`        | `string`                         |    O |
| `groupSize`        | `number`                         |    O |
| `myRankPercentile` | `number`                         |    O |
| `monthlyResult`    | `ChallengeMonthlyResultResponse` |    O |
| `topMembers`       | `ChallengeMemberResponse[]`      |    O |

## 15. 미션·투자 뱃지 화면

- 화면 ID: `CHALLENGE_02_MISSIONS_BADGES`
- Route: `/missions`, `/badges`
- API: 오늘 미션, 미션 완료, 투자 뱃지 목록

### MissionResponse

| 필드               | 타입                                    | 필수 |
| ------------------ | --------------------------------------- | ---: |
| `id`               | `number`                                |    O |
| `title`            | `string`                                |    O |
| `missionType`      | `SAFE \| AGGRESSIVE \| COMMON`          |    O |
| `rewardExperience` | `number`                                |    O |
| `status`           | `AVAILABLE \| IN_PROGRESS \| COMPLETED` |    O |
| `progress`         | `number`                                |    O |
| `target`           | `number`                                |    O |

### MissionCompletionResponse

| 필드           | 타입                              | 필수 |
| -------------- | --------------------------------- | ---: |
| `mission`      | `MissionResponse`                 |    O |
| `badgeChanged` | `boolean`                         |    O |
| `currentBadge` | `InvestmentBadgeResponse \| null` |    O |

### InvestmentBadgeResponse

| 필드                     | 타입                | 필수 |
| ------------------------ | ------------------- | ---: |
| `badgeGrade`             | `string`            |    O |
| `investmentType`         | `InvestmentType`    |    O |
| `safeCount`              | `number`            |    O |
| `aggressiveCount`        | `number`            |    O |
| `level`                  | `number`            |    O |
| `missionsUntilNextLevel` | `number`            |    O |
| `unlockedAt`             | `string(date-time)` |    O |

`badgeGrade`는 `BRONZE`, `SILVER`, `GOLD`, `PLATINUM`, `DIAMOND` 중 하나입니다.
완료 미션 수 기준은 각각 1회, 10회, 50회, 100회, 300회입니다. 화면에서는
`missionCount`가 제공되면 이를 우선 사용하고, 없는 경우 `safeCount + aggressiveCount`로
완료 미션 수를 계산합니다.

대표 뱃지 선택은 현재 프런트엔드의 브라우저 저장소에 유지합니다. 기기 간 동기화가 필요하면
대표 뱃지 ID를 저장하는 사용자 설정 API를 별도로 제공해야 합니다.

## 16. 전역 리포트 화면

- 화면 ID: `REPORT_01_DISCHARGE`
- Route: `/reports/discharge`
- API: `GET /api/v1/reports/discharge`

| 필드                             | 타입                   | 필수 |
| -------------------------------- | ---------------------- | ---: |
| `generatedAt`                    | `string(date-time)`    |    O |
| `currentAsset`                   | `number`               |    O |
| `projectedAssetAtDischarge`      | `number`               |    O |
| `targetAmount`                   | `number`               |    O |
| `goalAchievementRateAtDischarge` | `number`               |    O |
| `shortfallAmount`                | `number`               |    O |
| `financialDischargeDate`         | `string(date) \| null` |    O |
| `summary`                        | `string`               |    O |

## 17. 금융상품 추천 화면

- 화면 ID: `REPORT_02_PRODUCTS`
- Route: `/products/recommendations`
- API: `GET /api/v1/products/recommendations`

| 필드                 | 타입                | 필수 |
| -------------------- | ------------------- | ---: |
| `id`                 | `number`            |    O |
| `productName`        | `string`            |    O |
| `provider`           | `string`            |    O |
| `productStatus`      | `ProductStatus`     |    O |
| `investmentType`     | `InvestmentType`    |    O |
| `riskGrade`          | `number`            |    O |
| `expectedReturnRate` | `number \| null`    |    O |
| `reason`             | `string`            |    O |
| `isBeta`             | `boolean`           |    O |
| `dataAsOf`           | `string(date-time)` |    O |

## 18. 군인 혜택 화면

- 화면 ID: `REPORT_03_BENEFITS`
- Route: `/benefits`
- API: `GET /api/v1/benefits?category=&rank=`

| 필드              | 타입           | 필수 |
| ----------------- | -------------- | ---: |
| `id`              | `number`       |    O |
| `title`           | `string`       |    O |
| `category`        | `string`       |    O |
| `rank`            | `string`       |    O |
| `discountSummary` | `string`       |    O |
| `requiredProof`   | `string`       |    O |
| `validFrom`       | `string(date)` |    O |
| `validTo`         | `string(date)` |    O |
| `verifiedAt`      | `string(date)` |    O |
| `sourceUrl`       | `string`       |    O |

## 19. 리밸런싱 화면

- 화면 ID: `AI_03_REBALANCING`
- Route: `/ai-coach/rebalancing`
- API: 추천 조회, 추천 적용

### RebalancingRecommendationResponse

| 필드                   | 타입                | 필수 |
| ---------------------- | ------------------- | ---: |
| `id`                   | `number`            |    O |
| `marketCondition`      | `MarketCondition`   |    O |
| `currentRatio`         | `object`            |    O |
| `recommendedRatio`     | `object`            |    O |
| `remainingServiceDays` | `number`            |    O |
| `reason`               | `string`            |    O |
| `dataAsOf`             | `string(date-time)` |    O |

## 20. 알림 화면

- 화면 ID: `MY_01_NOTIFICATIONS`
- Route: `/notifications`
- API: 토큰 등록, 알림 이력, 읽음 처리

### DeviceTokenRequest / DeviceTokenResponse

| 필드         | 타입                | 필수 |
| ------------ | ------------------- | ---: |
| `deviceType` | `DeviceType`        |    O |
| `token`      | `string`            |    O |
| `createdAt`  | `string(date-time)` | 응답 |

### NotificationResponse

| 필드        | 타입                | 필수 |
| ----------- | ------------------- | ---: |
| `id`        | `number`            |    O |
| `type`      | `string`            |    O |
| `title`     | `string`            |    O |
| `message`   | `string`            |    O |
| `isRead`    | `boolean`           |    O |
| `createdAt` | `string(date-time)` |    O |

## 21. 휴가모드 화면

- 화면 ID: `LEAVE_01_MODE`
- Route: `/leave-mode`
- API: `POST /api/v1/leave-mode`, `GET /api/v1/leave-mode/current`

### LeaveModeRequest / LeaveModeResponse

| 필드                   | 타입           | 필수 | 설명               |
| ---------------------- | -------------- | ---: | ------------------ |
| `startDate`            | `string(date)` |    O | 휴가 시작일        |
| `endDate`              | `string(date)` |    O | 휴가 종료일        |
| `budget`               | `number`       |    O | 전체 예산          |
| `active`               | `boolean`      | 응답 | 현재 활성화 여부   |
| `currentDay`           | `number`       | 응답 | 휴가 며칠째        |
| `totalDays`            | `number`       | 응답 | 전체 일수          |
| `spentAmount`          | `number`       | 응답 | 사용액             |
| `remainingBudget`      | `number`       | 응답 | 남은 예산          |
| `dailyAvailableAmount` | `number`       | 응답 | 일평균 사용 가능액 |

`GET /leave-mode/current`는 휴가 중이 아니면 `204 No Content`를 반환하므로 화면에서 `response.status === 204`를 처리합니다.

## 22. 오늘의 AI 투자 리포트 화면

- 화면 ID: `AI_04_TODAY_MARKET_REPORT`
- Route: `/ai-coach/market-report`
- API: `GET /api/v1/market-reports/today`

### TodayMarketReportResponse

| 필드              | 타입                | 필수 |
| ----------------- | ------------------- | ---: |
| `reportDate`      | `string(date)`      |    O |
| `validFrom`       | `string(date-time)` |    O |
| `validUntil`      | `string(date-time)` |    O |
| `marketCondition` | `MarketCondition`   |    O |
| `title`           | `string`            |    O |
| `summary`         | `string`            |    O |
| `details`         | `string[]`          |    O |
| `dataAsOf`        | `string(date-time)` |    O |
| `isBeta`          | `boolean`           |    O |

## 23. 마이페이지

- 화면 ID: `MY_02_PAGE`
- Route: `/my-page`
- 사용 API: 닉네임 변경, 프로필 외형 변경, 계좌 목록, 투자 뱃지 목록, 로그아웃, 회원 탈퇴

프로필 전체 조회 API는 제공된 명세에 없으므로 로그인 응답과 Pinia 사용자 상태를 사용합니다. 새로고침 이후에도 사용자 정보를 복구해야 한다면 백엔드에 `GET /api/v1/users/me` 추가 여부를 확인해야 합니다.

---

## DTO 변경 관리 규칙

1. 백엔드 DTO 필드가 변경되면 이 문서를 먼저 수정합니다.
2. `mock-server/db.json`의 동일 DTO 예시를 수정합니다.
3. `mock-server/server.js` 응답 매핑을 수정합니다.
4. 기능별 `api/*.api.js`와 화면을 수정합니다.
5. DTO 명칭은 백엔드 명세의 클래스 이름과 동일하게 유지합니다.
6. 제공된 API 명세에 없는 엔드포인트를 임의로 추가하지 않습니다.
