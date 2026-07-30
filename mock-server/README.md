# JAEDAERO json-server 목 API

실제 Spring, CODEF, AI API를 호출하지 않고 프론트엔드만 테스트하는 로컬 서버입니다. 기본 json-server 리소스 경로가 아니라, 제공된 백엔드 명세와 동일한 `/api/v1/...` 경로를 `server.js`에서 구현합니다.

## 설치

```bash
npm install
```

개발 의존성:

```json
{
  "json-server": "0.17.4",
  "concurrently": "latest"
}
```

## 실행

```bash
npm run mock
```

```text
http://localhost:3001/api/v1
```

Vue와 동시 실행:

```bash
npm run dev:mock
```

## 주요 확인 경로

```text
POST   /api/v1/auth/login
GET    /api/v1/dashboard
GET    /api/v1/cashflow?months=8
GET    /api/v1/accounts
GET    /api/v1/transactions
POST   /api/v1/simulations
GET    /api/v1/ai-analyses/1
GET    /api/v1/missions/today
GET    /api/v1/reports/discharge
GET    /api/v1/leave-mode/current
GET    /api/v1/market-reports/today
```

전체 경로는 `docs/api-endpoint-mapping.md`에서 확인합니다.

## Axios 환경변수

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_USE_MOCK_SERVER=true
```

실제 백엔드 전환:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_USE_MOCK_SERVER=false
```

## 204 응답 처리

다음 API는 body가 없습니다.

- 로그아웃
- 회원 탈퇴
- 닉네임 변경
- 프로필 외형 변경
- 알림 읽음 처리
- 휴가모드가 활성 상태가 아닐 때의 현재 상태 조회

```js
const response = await apiClient.get(ENDPOINTS.leaveMode.current)
if (response.status === 204) {
  return null
}
return response.data
```

## 데이터 초기화

`server.js`의 POST·PUT 동작은 `db.json`을 수정합니다. 초기 상태로 되돌리려면 Git에서 `mock-server/db.json`을 복구합니다.

원본 리소스 디버깅 경로:

```text
GET /__db/users
GET /__db/transactions
```
