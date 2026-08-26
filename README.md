# 🪖 제대로 (Jaedaero) Frontend

전역 예정 장병의 확정 소득과 금융 데이터를 기반으로 전역 예상 자산, 재정적 전역일, 목표 달성 전략을 제공하는 군 특화 AI 자산관리 서비스의 프론트엔드입니다.

## 주요 기능

- Google·Kakao 소셜 로그인과 온보딩
- CODEF 금융기관 연동과 통합 자산·거래 내역 조회
- 전역 예상 자산, 재정적 전역일, 휴가 예산 관리
- AI 자산 분석, What-if 시뮬레이션, 금융상품·적립식 투자 가이드
- 오늘의 미션, 챌린지, 군인 혜택, 투자 뱃지
- FCM 푸시 알림과 PWA

## 기술 스택

- Vue 3, JavaScript, Vite
- Pinia, Vue Router, Axios
- Tailwind CSS
- Firebase Cloud Messaging
- Vite PWA

## 시작하기

### 사전 준비

- Node.js `22.18.x` 또는 `24.12.0` 이상
- npm

### 설치 및 실행

```bash
npm ci
cp .env.example .env
npm run dev
```

Windows PowerShell에서는 환경 파일을 다음과 같이 복사합니다.

```powershell
Copy-Item .env.example .env
```

개발 서버는 `http://localhost:5173`에서 실행됩니다. 포트가 사용 중이면 실행이 중단됩니다.

## 환경 변수

`.env.example`을 기준으로 `.env`를 작성합니다.

| 변수                    | 용도                       | 기본값    |
| ----------------------- | -------------------------- | --------- |
| `VITE_API_BASE_URL`     | 백엔드 API 기본 경로       | `/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | 없음      |
| `VITE_KAKAO_CLIENT_ID`  | Kakao OAuth 클라이언트 ID  | 없음      |
| `VITE_FIREBASE_*`       | FCM 초기화 및 웹 푸시 설정 | 없음      |

로컬에서 `/api` 요청은 `vite.config.js`의 프록시 설정을 통해 백엔드로 전달됩니다. OAuth·Firebase 기능을 확인하려면 해당 환경 변수를 모두 설정해야 합니다.

API Secret과 Client Secret은 프론트엔드 환경 변수나 소스 코드에 저장하지 않습니다.

## npm 명령어

| 명령어             | 설명                      |
| ------------------ | ------------------------- |
| `npm run dev`      | 개발 서버 실행            |
| `npm run build`    | 운영용 빌드 생성          |
| `npm run preview`  | 빌드 결과 로컬 미리보기   |
| `npm run lint`     | ESLint 검사               |
| `npm run lint:fix` | ESLint 자동 수정          |
| `npm run format`   | Prettier 포맷 적용        |
| `npm run commit`   | 프로젝트 커밋 도우미 실행 |

## 프로젝트 구조

```text
src/
├── app/                         # 라우터, 레이아웃, 앱 진입점
├── assets/                      # 이미지, 아이콘, 폰트
├── common/                      # API, 인증, 공통 컴포넌트·스타일
├── features/                    # 도메인별 화면, 상태, API, 컴포넌트
│   ├── auth/                    # 로그인·인증
│   ├── onboarding/              # 온보딩·계좌 연동
│   ├── dashboard/               # 대시보드·자산
│   ├── ai-analysis/             # AI 분석·이력
│   ├── simulations/             # What-if·상품 추천
│   └── ...                      # 거래, 미션, 알림, 리포트 등
├── firebase-messaging-sw.js     # FCM 서비스 워커
└── main.js                      # Vue 앱 부트스트랩
```

상세 구조는 [파일 구조 문서](docs/file-structure.md)에서 확인합니다.

## API 연동 규칙

- `src/common/api/client.js`: API 기본 설정, JWT 주입, 토큰 재발급·재시도
- `src/common/api/endpoints.js`: REST API 경로 통합 관리
- `src/features/*/api`: 도메인별 API 호출

엔드포인트를 임의로 추가하지 않고 [API 명세 반영표](docs/api-endpoint-mapping.md)를 기준으로 합니다. 화면 데이터 형식은 [화면별 데이터 타입 명세서](docs/screen-data-spec.md)와 동기화합니다.

데이터 필드나 API 경로가 변경되면 다음을 함께 수정합니다.

1. `docs/api-endpoint-mapping.md` 또는 `docs/screen-data-spec.md`
2. `src/common/api/endpoints.js`
3. 해당 `src/features/*/api/*.api.js`

## 검증 및 빌드

변경 전 아래 검사를 실행합니다.

```bash
npm run lint
npm run build
```

Vercel 배포 시 SPA 라우팅과 `/api` 프록시는 `vercel.json`의 rewrite 설정을 사용합니다.
