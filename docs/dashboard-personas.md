# 대시보드 테스트 퍼소나

`src/features/dashboard/mocks/dashboard.personas.js`에 구현된 대시보드 시각 테스트 데이터입니다. `persona` 쿼리를 사용하면 서버 API를 호출하지 않습니다.

## 사용법

```text
/home?persona=private-newcomer
/home?persona=pfc-safe-px
/home?persona=corporal-balanced-profit
/home?persona=sergeant-aggressive-loss
```

특정 컴포넌트 상태를 추가로 강제하려면 `scenario`를 함께 사용합니다.

```text
/home?persona=corporal-balanced-profit&scenario=no-investment-account
```

합성 우선순위는 `공통 기본값 → persona → scenario`입니다.

## 퍼소나 요약

| 퍼소나                     | 프로필                       |     현재/목표 자산 |  월 수입 |               투자 |      지출/목표 | 계좌 | 완료 미션 |
| -------------------------- | ---------------------------- | -----------------: | -------: | -----------------: | -------------: | ---: | --------: |
| `private-newcomer`         | 첫걸음곰·이병·`BALANCED`     |    35만/1,700만 원 |      0원 |             미연동 |  4.2만/15만 원 |  1개 |       0/4 |
| `pfc-safe-px`              | 절약일병·일병·`SAFE`         |   520만/2,000만 원 |  90만 원 |             미연동 | 23.8만/15만 원 |  2개 |       3/4 |
| `corporal-balanced-profit` | 균형상병·상병·`BALANCED`     | 1,285만/2,300만 원 | 135만 원 | 242만 원, +12만 원 | 10.8만/18만 원 |  3개 |       2/4 |
| `sergeant-aggressive-loss` | 전역앞병장·병장·`AGGRESSIVE` | 1,420만/1,700만 원 | 150만 원 | 420만 원, -18만 원 | 15.4만/10만 원 |  3개 |       4/4 |

모든 퍼소나의 `events`는 현재 빈 배열입니다. 예정 이벤트 API가 연결되기 전까지 이벤트 카드는 빈 상태만 검증합니다.

## 퍼소나별 확인 항목

### `private-newcomer`

- 낮은 목표 달성률과 프로그레스 시작 지점
- 수입 0원과 증권계좌 연결 유도
- 예정 이벤트 빈 상태
- 모든 미션 미완료

### `pfc-safe-px`

- 월 수입과 급여가 같은 상태
- 투자 미연동과 지출 목표 초과
- 완료·미완료 미션 혼합

### `corporal-balanced-profit`

- 급여 외 수입 15만 원과 추가 수입 배지
- 증권계좌 보유, 투자 수익 +12만 원·+5.2%
- 지출 목표 이내

### `sergeant-aggressive-loss`

- 재정적 전역일이 실제 전역일보다 8일 느린 상태
- 투자 손실 -18만 원·-4.1%
- 지출 목표 초과와 모든 미션 완료

## 컴포넌트 시나리오

| 키                      | 확인 상태       |
| ----------------------- | --------------- |
| `default`               | 공통 기본 목    |
| `investment-profit`     | 투자 수익       |
| `investment-loss`       | 투자 손실       |
| `investment-steady`     | 투자 변동 없음  |
| `no-investment-account` | 증권계좌 미연동 |
| `spending-over`         | 지출 목표 초과  |
| `spending-safe`         | 지출 목표 이내  |
| `spending-no-target`    | 지출 목표 없음  |

## 테스트 체크리스트

| 화면 조건        | 이병 | 일병 | 상병 | 병장 |
| ---------------- | :--: | :--: | :--: | :--: |
| 수입 0원         |  O   |  -   |  -   |  -   |
| 증권계좌 미연동  |  O   |  O   |  -   |  -   |
| 투자 수익        |  -   |  -   |  O   |  -   |
| 투자 손실        |  -   |  -   |  -   |  O   |
| 지출 목표 이내   |  O   |  -   |  O   |  -   |
| 지출 목표 초과   |  -   |  O   |  -   |  O   |
| 재정적 전역 지연 |  -   |  -   |  -   |  O   |
| 미션 전체 미완료 |  O   |  -   |  -   |  -   |
| 미션 일부 완료   |  -   |  O   |  O   |  -   |
| 미션 전체 완료   |  -   |  -   |  -   |  O   |

## 구현 파일

- `src/features/dashboard/mocks/dashboard.personas.js`: 퍼소나 데이터
- `src/features/dashboard/mocks/dashboard.mock.js`: 기본 목·시나리오 합성
- `src/features/dashboard/stores/dashboard.store.js`: 쿼리 조건에 따른 API·목 분기
- `src/features/dashboard/views/DashboardView.vue`: `persona`, `scenario` 쿼리 전달
