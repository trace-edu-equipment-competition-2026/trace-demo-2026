# TRACE Demo 2026

교육장비 시스템의 교수자·학생 사용 흐름을 보여주는 한국어 UI 데모.

## 개발

Node.js 22.18.0 (`nvm use`), npm 사용.

```sh
npm ci
npm run dev
```

http://localhost:5173 에서 확인. 교수자 과제 생성·모니터링·평가와 학생 프로젝트 작업실·학습 지원을 연결한 데모다.

```sh
npm run check        # 타입, lint, 배포 빌드
npm run dev:tablet   # 같은 Wi-Fi 태블릿에서 Mac의 LAN IP:5173으로 접속
npm run preview     # 빌드 결과 확인
```

태블릿 접속은 로컬 네트워크/방화벽 허용이 필요하다. 기본 dev는 로컬 컴퓨터에만 공개한다.

## 구성

React + TypeScript + Vite, Tailwind CSS, shadcn/ui 기반 환경. 현재 아이콘은 사용자가 지정한 Figma coolicons에서 내보낸 SVG를 사용한다. 간단한 탭 전환은 CSS로 구현하며 Motion은 후속 사용을 위해 설치되어 있다.
Motion Primitives는 필요한 컴포넌트를 선택해서 추가하는 방식이므로 아직 별도 복사하지 않았다.
`@/`는 `src/` 경로. `components.json`은 shadcn 설정.

- `src/`: 앱 코드
- `docs/references/`: 사용자 제공 UI 이미지
- `PRODUCT.md`, `docs/design-brief.md`: 범위와 시각 기준
- `.agents/skills/`: 프로젝트 전용 Ponytail, Impeccable 원본 스킬

UI는 데스크톱 및 태블릿을 대상으로 한다. 현대 브라우저 기준이며 Tailwind v4 사용으로 Safari 16.4+, Chrome 111+, Firefox 128+를 기준으로 한다.
Ponytail은 구현 단순화, Impeccable은 디자인 판단·검토에 사용한다. 사용자 레퍼런스가 우선이다.
스킬은 프로젝트를 여는 다음 에이전트 턴에서 발견할 수 있다. 로더 실행이 필요하면 `sh .agents/skills/impeccable/scripts/impeccable context`를 사용할 수 있다.

## Git

Remote: https://github.com/hazyala/trace-demo-2026.git
작업 브랜치: dev

실제 로그인·서버·AI API는 아직 연결하지 않았다. 민감한 키는 커밋하지 않는다.

시작 및 새로고침 시 교수자의 「수업 대시보드」가 열립니다. 과제 작성은 사이드바의 「프로젝트 · 과제 생성」에서 시작합니다.

## 시연 순서

1. 미리 채운 네트워크 장애 진단 과제를 수정한다.
2. 과목 설정에서 목표를 불러와 선택하고, Chip을 눌러 수정하거나 삭제한다.
3. 요구사항·산출물·평가 요소를 추가한다. 산출물마다 지정 양식을 별도로 첨부할 수 있다. 평가 비율 합계는 100%여야 다음 단계로 넘어간다.
4. AI 운영 방식 세 탭을 전환하고, 상황·개입·가이던스 설정을 조정한다.
5. 학생 화면 미리보기에서 과제·양식 다운로드·학습 지원 대화 예시를 확인한다.
6. 임시 저장 또는 과제 생성. 데이터와 첨부 양식은 현재 브라우저 localStorage에 저장된다. 양식은 파일당 2MB까지이며 저장 공간 부족 시 오류를 표시한다.

데모 제한: AI 목표 추천과 학습 지원은 작성된 예시·상태 규칙이며 외부 AI 호출은 없다. 과제 생성은 같은 브라우저의 학생 안내·지원 정책에 적용된다. 학생이 명시적으로 공유한 모의 실행·판단·외부 수행자료를 Learning Evidence로 저장하며 서버 배포·실제 장비 실행·자동 채점을 뜻하지 않는다.

논문의 핵심 흐름을 시연하려면 [정책 → 즉시 가이던스 → 학생 판단 → 검증 → 추가 문제 상황 승인 → 재검증](docs/paper-learning-cycle.md)를 따른다. 네트워크·융합의 정확한 명령과 한국어 버튼, 유송민 · 1팀 찾기, 대안 자료 검토, 한 번의 추가 상황 및 개인정보 경계를 포함한다. 「임시 저장」은 초안이며 학생 정책은 「과제 생성」/「과제 다시 저장」 시 적용된다.

## 브라우저 검증

```sh
npm test
```

Playwright가 설치된 Google Chrome을 사용한다. 타입·린트·빌드는 `npm run check`. 기능 검증과 1440/1180/820/390px 화면 캡처를 수행한다. 캡처는 `.impeccable/review/`에 저장되며 커밋하지 않는다.
