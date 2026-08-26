# API 엔드포인트 반영표

현재 프론트엔드가 호출하는 REST API 목록입니다. 실행 경로는 `src/common/api/endpoints.js`, HTTP 메서드와 파라미터는 `src/features/*/api/*.api.js`를 기준으로 합니다.

- 기본 경로: `/api/v1`
- 인증: 로그인·토큰 재발급을 제외한 요청에 Bearer Access Token 자동 추가
- 응답 래핑: API 모듈은 `data.data`, 배열, 페이지 응답을 필요에 따라 정규화
- 최종 백엔드 DTO 계약: 백엔드 `api-endpoint-mapping.md`와 Swagger

## 인증·온보딩·마이페이지

| Method | Path                                       | 용도              | 프론트 모듈                          |
| ------ | ------------------------------------------ | ----------------- | ------------------------------------ |
| POST   | `/api/v1/auth/login`                       | 소셜 로그인       | `auth.api.js`                        |
| POST   | `/api/v1/auth/refresh`                     | 토큰 재발급       | `auth.api.js`, `client.js`           |
| POST   | `/api/v1/auth/logout`                      | 로그아웃          | `auth.api.js`                        |
| GET    | `/api/v1/users/me`                         | 현재 사용자 조회  | `myPage.api.js`                      |
| DELETE | `/api/v1/users/me`                         | 회원 탈퇴         | `myPage.api.js`                      |
| GET    | `/api/v1/users/nickname/availability`      | 닉네임 중복 확인  | `onboarding.api.js`, `myPage.api.js` |
| PUT    | `/api/v1/users/nickname`                   | 닉네임 설정·변경  | `onboarding.api.js`, `myPage.api.js` |
| PUT    | `/api/v1/users/profile-appearance`         | 프로필 외형 설정  | `onboarding.api.js`, `myPage.api.js` |
| GET    | `/api/v1/users/investment-badges`          | 투자 뱃지 조회    | `challenges.api.js`                  |
| POST   | `/api/v1/agreements`                       | 약관 동의 저장    | `onboarding.api.js`                  |
| POST   | `/api/v1/onboarding/military-info`         | 군 복무 정보 저장 | `onboarding.api.js`                  |
| POST   | `/api/v1/onboarding/investment-preference` | 투자 성향 저장    | `onboarding.api.js`                  |
| GET    | `/api/v1/goals`                            | 목표 조회         | `myPage.api.js`                      |
| PUT    | `/api/v1/goals`                            | 목표 설정·변경    | `onboarding.api.js`, `myPage.api.js` |

## 계좌·자산·거래

| Method | Path                                            | 용도                  | 프론트 모듈                  |
| ------ | ----------------------------------------------- | --------------------- | ---------------------------- |
| POST   | `/api/v1/accounts/connect`                      | 금융기관 계좌 연동    | `accounts.api.js`            |
| GET    | `/api/v1/accounts`                              | 연동 계좌 목록        | `accounts.api.js`            |
| DELETE | `/api/v1/accounts/{accountId}`                  | 계좌 연동 해제        | `accounts.api.js`            |
| PATCH  | `/api/v1/accounts/{accountId}/activate`         | 해제 계좌 재연동      | `accounts.api.js`            |
| GET    | `/api/v1/investments/securities`                | 증권 포트폴리오       | `securitiesPortfolio.api.js` |
| GET    | `/api/v1/transactions`                          | 거래 내역 목록        | `transactions.api.js`        |
| GET    | `/api/v1/transactions/securities/{accountId}`   | 증권계좌 거래 내역    | `transactions.api.js`        |
| PUT    | `/api/v1/transactions/{transactionId}/category` | 거래 카테고리 변경    | `transactions.api.js`        |
| GET    | `/api/v1/soldier-savings`                       | 장병내일준비적금 조회 | `soldierSavings.api.js`      |

`GET /accounts`의 `userId` 쿼리와 일부 CODEF 요청의 `X-User-Id`는 현재 백엔드 호환을 위해 API 모듈이 추가합니다. 사용자 식별의 기본은 Bearer Token입니다.

## 대시보드·예측·AI 분석

| Method | Path                                     | 용도                 | 프론트 모듈          |
| ------ | ---------------------------------------- | -------------------- | -------------------- |
| GET    | `/api/v1/dashboard`                      | 홈 요약              | `dashboard.api.js`   |
| GET    | `/api/v1/cashflow`                       | 월별 자산 흐름       | `cashflow.api.js`    |
| POST   | `/api/v1/cashflow`                       | 캐시플로우 초기 생성 | `cashflow.api.js`    |
| GET    | `/api/v1/simulations/defaults`           | What-if 기본값       | `simulations.api.js` |
| POST   | `/api/v1/simulations`                    | What-if 실행         | `simulations.api.js` |
| GET    | `/api/v1/simulations`                    | What-if 이력         | `simulations.api.js` |
| GET    | `/api/v1/simulations/{simulationId}`     | What-if 상세         | `simulations.api.js` |
| POST   | `/api/v1/ai-analyses`                    | AI 소비 분석 생성    | `aiAnalysis.api.js`  |
| GET    | `/api/v1/ai-analyses/{analysisId}`       | AI 분석 상세         | `aiAnalysis.api.js`  |
| POST   | `/api/v1/ai-analyses/{analysisId}/apply` | AI 전략 적용         | `aiAnalysis.api.js`  |
| GET    | `/api/v1/analysis-histories`             | What-if·AI 통합 이력 | `aiAnalysis.api.js`  |

## 미션·리포트·투자 가이드

| Method | Path                                              | 용도                  | 프론트 모듈                            |
| ------ | ------------------------------------------------- | --------------------- | -------------------------------------- |
| GET    | `/api/v1/challenges/group`                        | 동기 그룹·랭킹        | `challenges.api.js`                    |
| GET    | `/api/v1/missions/today`                          | 오늘의 미션           | `missions.api.js`, `challenges.api.js` |
| POST   | `/api/v1/missions/{missionId}/complete`           | 미션 완료             | `missions.api.js`, `challenges.api.js` |
| GET    | `/api/v1/reports/discharge`                       | 전역 리포트           | `reports.api.js`                       |
| GET    | `/api/v1/products/recommendations`                | 금융상품 추천         | `reports.api.js`                       |
| GET    | `/api/v1/benefits`                                | 군인 혜택             | `reports.api.js`                       |
| GET    | `/api/v1/recurring-investment-plans/me`           | 적립식 투자 계획      | `rebalancing.api.js`                   |
| PUT    | `/api/v1/recurring-investment-plans/me`           | 적립식 투자 계획 저장 | `rebalancing.api.js`                   |
| GET    | `/api/v1/investment-guidances/latest`             | 최신 투자 가이드      | `rebalancing.api.js`                   |
| GET    | `/api/v1/investment-guidances/{guidanceId}`       | 투자 가이드 상세      | `rebalancing.api.js`                   |
| POST   | `/api/v1/investment-guidances`                    | 투자 가이드 생성      | `rebalancing.api.js`                   |
| POST   | `/api/v1/investment-guidances/{guidanceId}/apply` | 투자 가이드 적용      | `rebalancing.api.js`                   |

## 알림·휴가모드·시장 리포트

| Method | Path                                          | 용도                       | 프론트 모듈            |
| ------ | --------------------------------------------- | -------------------------- | ---------------------- |
| POST   | `/api/v1/device-tokens`                       | FCM 디바이스 토큰 등록     | `notifications.api.js` |
| DELETE | `/api/v1/device-tokens/{deviceTokenId}`       | FCM 디바이스 토큰 비활성화 | `notifications.api.js` |
| GET    | `/api/v1/notifications`                       | 알림 목록                  | `notifications.api.js` |
| GET    | `/api/v1/notifications/unread-count`          | 안 읽은 알림 수            | `notifications.api.js` |
| PUT    | `/api/v1/notifications/{notificationId}/read` | 알림 읽음                  | `notifications.api.js` |
| PUT    | `/api/v1/notifications/read-all`              | 알림 모두 읽음             | `notifications.api.js` |
| POST   | `/api/v1/leave-mode`                          | 휴가모드 시작              | `leaveMode.api.js`     |
| GET    | `/api/v1/leave-mode`                          | 휴가모드 이력              | `leaveMode.api.js`     |
| GET    | `/api/v1/leave-mode/current`                  | 현재 휴가모드              | `leaveMode.api.js`     |
| PUT    | `/api/v1/leave-mode/{leaveModeId}/budget`     | 휴가 예산 변경             | `leaveMode.api.js`     |
| DELETE | `/api/v1/leave-mode/{leaveModeId}`            | 휴가모드 삭제·종료         | `leaveMode.api.js`     |
| GET    | `/api/v1/market-reports/today`                | 오늘의 AI 시장 리포트      | `marketReport.api.js`  |
| GET    | `/api/v1/market-reports/today/indicators`     | 오늘의 시장 지표           | `marketReport.api.js`  |

## 현재 제한

- 예정 이벤트는 서버 API가 연결되지 않아 실제 사용자 모드에서 빈 목록을 사용합니다.
- `persona`, `scenario` 쿼리가 있는 대시보드는 명시적으로 목데이터를 사용하며 API를 호출하지 않습니다.
- `src/common/api/endpoints.js`에 경로를 추가할 때는 이 문서와 해당 기능 API 모듈을 함께 수정합니다.
