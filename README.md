# 🪖 제대로 (Jaedaero) Frontend

전역 예정 장병의 **확정 소득과 실제 금융 데이터**를 기반으로 전역 시점의 예상 자산을 계산하고, 목표 달성을 위한 금융 행동을 제안하는 군 특화 AI 자산관리 서비스의 프론트엔드 프로젝트입니다.

## 서비스 핵심

> 제대로는 군 장병의 현재 자산, 계급별 미래 급여, 장병내일준비적금, 소비와 투자 계획을 분석하여 **전역 예상 자산**과 **재정적 전역일**을 제공하는 AI 금융 코치입니다.

## 주요 기능

### 1. 온보딩

- Google·Kakao 소셜 로그인
- CODEF 장병내일준비적금 및 기타 계좌 연동
- 닉네임과 프로필 설정
- 군종, 계급, 입대일, 전역예정일 등 군 정보 등록
- 목표 금액 설정 및 달성 가능성 안내
- 초기 투자 선호 설정
- 최종 입력 정보 확인

### 2. 대시보드

- CODEF 기반 통합 자산 조회
- 총자산, 목표 달성률, 자산 변화 그래프
- 실제 전역일과 재정적 전역일 비교
- 이벤트에 따라 달라지는 AI 금융 데일리 브리핑
- 오늘의 미션 및 예정 이벤트
- 최근 거래내역과 거래 카테고리 확인

### 3. 확정소득 캐시플로우

- 계급별 급여와 진급 일정 반영
- 장병내일준비적금과 정부 매칭지원금 반영
- 휴가, 외출, 외박 등 이벤트성 지출 반영
- 전역 예상 자산 및 목표 예상 달성일 계산
- What-if 자산 시뮬레이션

### 4. AI 코치

- 자산 변화 원인과 개선 행동 분석
- 적립식 투자 및 금융상품 추천
- 오늘의 AI 투자 리포트
- 잔여 복무일 기반 글라이드패스
- 시장 상황 기반 리밸런싱 제안

> AI 투자 및 상품 추천 기능은 참고용 Beta 기능이며 실제 수익을 보장하지 않습니다.

### 5. 미션 및 투자 뱃지

- 오늘의 금융 미션
- 안정형·공격형·공통 미션
- 미션 달성 결과에 따른 투자유형 해금
- 안정형·균형형·공격형 투자 뱃지
- 뱃지 레벨과 획득 이력 확인

### 6. 이벤트 및 휴가모드

- 휴가, 외출, 외박, 진급 등 주요 일정 등록
- 등록된 휴가 일정에 따른 휴가모드 자동 전환
- 휴가 예산과 사용금액 관리
- 나라사랑카드 및 군인 할인 혜택 제공

### 7. 동기 비교

- 입대월과 군종 기준 코호트 비교
- 동기 평균 목표 달성률, 저축률, 소비금액 비교
- 정확한 순위 대신 백분위와 평균 중심의 비교 제공

### 8. 마이페이지

- 계좌 추가 연결 및 해제
- 닉네임, 프로필 아이콘, 배경색 변경
- 군 정보와 목표 금액 수정
- 획득 뱃지 및 미션 이력 조회
- 알림 설정
- 로그아웃 및 회원 탈퇴

## 기술 스택

- Vue 3
- JavaScript (TypeScript 미사용)
- Vite
- Pinia
- Vue Router
- Axios

### JavaScript 사용 기준

- 모든 스크립트 파일은 `.js` 확장자를 사용합니다.
- Vue 컴포넌트는 `<script setup>` 형식으로 작성하며 `lang="ts"`를 사용하지 않습니다.
- `tsconfig.json`, `env.d.ts`, `vue-tsc`는 사용하지 않습니다.
- 경로 별칭이 필요한 경우 루트에 `jsconfig.json`을 추가합니다.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.js", "src/**/*.vue"]
}
```

## 실행 방법

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 환경변수

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=
VITE_KAKAO_CLIENT_ID=
```

- API Key와 Secret 값은 Git에 업로드하지 않습니다.
- 외부 서비스의 Secret Key는 프론트엔드가 아닌 백엔드에서 관리합니다.
- 프론트엔드에는 공개 가능한 Client ID만 설정합니다.

## 프로젝트 구조

프로젝트는 파일 종류별 구조가 아니라 **MVP 기능별 Feature 구조**를 사용합니다.

각 기능 안에서 해당 기능의 화면, 컴포넌트, API, 상태와 로직을 함께 관리하여 기능을 수정할 때 여러 전역 폴더를 오가지 않도록 구성합니다.

```text
src/
├── app/                         # 앱 실행 및 전역 설정
│   ├── layouts/                 # 공통 페이지 레이아웃
│   │   ├── MainLayout.vue
│   │   └── OnboardingLayout.vue
│   ├── router/                  # Vue Router와 라우트 가드
│   │   ├── index.js
│   │   └── guards.js
│   └── App.vue
│
├── features/                    # MVP 기능별 모듈
│   ├── auth/                    # 소셜 로그인과 인증
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── stores/
│   │   ├── views/
│   │   └── routes.js
│   │
│   ├── onboarding/              # 계좌·프로필·군 정보·목표 설정
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── stores/
│   │   ├── views/
│   │   └── routes.js
│   │
│   ├── dashboard/               # 홈 대시보드와 데일리 브리핑
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── views/
│   │   └── routes.js
│   │
│   ├── accounts/                # 계좌 관리와 거래내역
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── views/
│   │   └── routes.js
│   │
│   ├── cashflow/                # 확정소득 계산과 What-if 시뮬레이션
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── stores/
│   │   ├── views/
│   │   └── routes.js
│   │
│   ├── ai-coach/                # AI 분석, 상품 추천, 리밸런싱
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── views/
│   │   └── routes.js
│   │
│   ├── missions/                # 미션과 투자 뱃지
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── views/
│   │   └── routes.js
│   │
│   ├── events/                  # 휴가·외출·진급 등 이벤트 등록
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── views/
│   │   └── routes.js
│   │
│   ├── vacation/                # 휴가모드와 휴가 예산·혜택
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── stores/
│   │   ├── views/
│   │   └── routes.js
│   │
│   ├── cohort/                  # 입대 동기 코호트 비교
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── views/
│   │   └── routes.js
│   │
│   └── my-page/                 # 프로필, 설정, 알림, 회원 관리
│       ├── api/
│       ├── components/
│       ├── composables/
│       ├── stores/
│       ├── views/
│       └── routes.js
│
├── shared/                      # 여러 기능에서 공통 사용
│   ├── api/
│   │   └── client.js            # Axios 인스턴스와 공통 인터셉터
│   ├── components/              # 버튼, 입력창, 모달 등 공통 UI
│   ├── composables/             # 공통 Composition 함수
│   ├── constants/               # 공통 상수
│   ├── utils/                   # 금액, 날짜, 검증 함수
│   └── styles/                  # 전역 스타일과 디자인 토큰
│
├── assets/                      # 이미지, 아이콘, 폰트
├── mocks/                       # 백엔드 연결 전 Mock 데이터
└── main.js
```

### 구조 원칙

- `features`: 사용자에게 제공되는 독립적인 기능 단위
- `shared`: 두 개 이상의 기능에서 공통으로 사용하는 코드
- `app`: 라우터, 레이아웃 등 앱 전체 실행 설정
- `views`: 라우터와 연결되는 페이지 컴포넌트
- `components`: 해당 기능 내부에서 재사용하는 UI 컴포넌트
- `api`: 해당 기능에서 사용하는 백엔드 API 요청
- `composables`: 해당 기능의 조회, 가공, 인터랙션 로직
- `stores`: 여러 화면에서 공유해야 하는 Pinia 상태

빈 폴더를 미리 모두 만들지 않고 실제 파일이 필요한 시점에 생성합니다.

### 루트 파일 구조

```text
frontend/
├── public/
├── src/
├── .env
├── .env.example
├── index.html
├── jsconfig.json
├── package.json
├── vite.config.js
└── README.md
```

## 백엔드 연동

프론트엔드는 Spring Boot 기반 백엔드 API와 통신합니다.

```text
Vue 3
  ↓
Spring Boot
  ├── MyBatis → MySQL
  ├── Redis Streams
  ├── Quartz Scheduler
  ├── CODEF API
  ├── Gemini API
  ├── 한국투자증권 API
  └── Firebase Cloud Messaging
```

외부 API는 프론트엔드에서 직접 호출하지 않고 백엔드 API를 통해 사용합니다.

## MVP 개발 순서

### 1단계: 핵심 자산관리

1. 소셜 로그인
2. 온보딩
3. 계좌 연동
4. 대시보드
5. 확정소득 캐시플로우
6. 재정적 전역일
7. What-if 시뮬레이션
8. 이벤트 등록 및 휴가모드
9. 마이페이지

### 2단계: 행동 유도 및 AI

1. 금융 미션
2. 투자 뱃지
3. 거래 카테고리 분류
4. AI 자산 분석
5. 금융 데일리 브리핑
6. 알림

### 3단계: 확장 기능

1. 동기 코호트 비교
2. 오늘의 AI 투자 리포트
3. 포트폴리오 추천
4. 리밸런싱과 글라이드패스
5. 외부 금융 API 실제 연동
