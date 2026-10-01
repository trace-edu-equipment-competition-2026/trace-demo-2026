# TRACE 교육장비 데모

교수자 과제 설계 → 학생 수행·검증 → 학습 증거 공유 → 교수자 검토 흐름 시연.
네트워크 실습 / 융합 팀 프로젝트. 한국어 화면. 브라우저 로컬 저장.

## 처음 실행

사전 준비: Git, Node.js 22.18.0, npm. 브라우저 검증에는 Google Chrome 필요.

```sh
git clone https://github.com/trace-edu-equipment-competition-2026/trace-demo-2026.git
cd trace-demo-2026
git switch dev
# nvm 설치 환경
nvm install
nvm use
npm ci
npm run dev
```

nvm 미사용 환경: Node.js 22.18.0 직접 설치 후 `npm ci`부터 실행.
터미널에 표시된 주소로 접속. 기본 주소: http://localhost:5173.
종료: 터미널에서 `Ctrl+C`.

## 시연

1. 시작 화면: 교수자 수업 대시보드.
2. 사이드바 수업 선택: 네트워크 실습 / 융합 팀 프로젝트 전환.
3. 「과목 설정」에서 목표·평가 기준·AI 기본 정책 확인 및 저장.
4. 「프로젝트 · 과제 생성」에서 과제 설계 → AI 운영 방식 → 학생 미리보기.
5. 「과제 생성」 또는 「과제 다시 저장」으로 학생 정책 적용. 「임시 저장」은 초안만 보관.
6. 하단 프로필에서 유송민 학생으로 전환. 「프로젝트 작업실」에서 기획 → 수행 → 실행 및 검증.
7. 검증 결과와 판단 설명 공유 후 교수자로 전환. 「팀별 모니터링」의 1팀과 「학생별 평가 지원」에서 확인.

정확한 명령·추가 문제 상황 시연: [학습 순환 안내](docs/paper-learning-cycle.md).

## 실행·검증 명령

| 명령 | 용도 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run dev:tablet` | 같은 Wi-Fi의 태블릿 접속. 컴퓨터 LAN IP와 표시된 포트 사용 |
| `npm run check` | 타입·린트·빌드 검증 |
| `npm test` | Chrome으로 기능·화면 검증. 개발 서버 자동 시작 |
| `npm run build` | `dist/` 생성 |
| `npm run preview` | 빌드 결과 확인. 터미널 주소 사용 |

태블릿: 컴퓨터의 로컬 네트워크·방화벽 허용 필요.
화면 캡처: `.impeccable/review/`. 테스트 보고서·빌드 결과는 커밋 제외.

## 코드 찾기

| 위치 | 역할 |
| --- | --- |
| [src/](src/README.md) | 화면·상태·시나리오·스타일 |
| [tests/](tests/README.md) | 기능·화면 검증 |
| [public/](public/README.md) | 아이콘·정적 파일 |
| [docs/](docs/README.md) | 설계·시연 안내 |
| [.agents/skills/](.agents/skills/README.md) | Ponytail·Impeccable 사용법 |
| [.impeccable/](.impeccable/README.md) | 디자인 토큰·검토 기록 |
| [AGENTS.md](AGENTS.md) | 에이전트 작업 규칙 |
| [PRODUCT.md](PRODUCT.md) / [DESIGN.md](DESIGN.md) | 제품 범위 / 공통 시각 기준 |

React + TypeScript + Vite. Tailwind CSS, shadcn/ui. `@/`는 `src/` 별칭.
`PRODUCT.md` 영문 섹션명·스키마, `DESIGN.md` 토큰 키는 도구 인식용 유지.

## Ponytail·Impeccable 사용

앱 실행에 스킬 설치 불필요. 코드·디자인 수정 시 에이전트가 프로젝트 로컬 스킬 사용.

- Ponytail: 기존 코드 재사용, 표준 기능 우선, 불필요한 의존성·추상화 방지.
- Impeccable: 기존 디자인 기준 유지, 화면 검토·접근성·반응형 점검.
- 요청 예: `Ponytail full 기준으로 이 기능 수정. 기존 화면과 기능 유지.`
- 요청 예: `Impeccable audit로 src/StudentWorkspace.tsx 검토. 한국어로 결과 정리.`
- 스킬 미인식 시 해당 `SKILL.md` 경로 직접 지정.
- 상세 명령과 주의점: [스킬 안내](.agents/skills/README.md).

## 함께 작업

작업 브랜치: `dev`. 수정 전 최신 커밋 확인.

```sh
git switch dev
git pull --ff-only
# 수정 후 검증
npm run check
git add 수정한파일
git commit -m "변경 내용"
git push origin dev
```

기존 복제본의 원격 주소 변경:

```sh
git remote set-url origin https://github.com/trace-edu-equipment-competition-2026/trace-demo-2026.git
```

충돌 시 덮어쓰기·강제 푸시 금지. 변경 내용 비교 후 병합.

## 저장·데모 범위

- 같은 브라우저의 `localStorage` 사용. 네트워크·융합 데이터 분리.
- 기기·브라우저 간 동기화 없음. 개인 AI 대화는 교수자 화면에서 제외.
- 실제 로그인·서버·AI API·장비 연결·자동 채점: 구현 예정.
- AI 가이던스·평가 추정·콘솔 출력: 고정 예시와 시연 규칙.
- 과제·팀 자료 첨부: 파일당 2MB 제한. 과목 가져오기: 파일당 10MB, 내용 분석 없는 예시 흐름.
- 새로고침: 기본 교수자 화면. 미저장 입력 소실 가능.
- 초기화: 개발자 도구의 로컬 저장소에서 `trace-` / `fusion-trace-` 관련 키만 삭제. 저장 자료 삭제 전 별도 보관.
- 인증 정보·API 키·실제 학생 개인정보 커밋 금지.

## 실행 문제

- Node.js 오류: `.nvmrc` 버전 확인 후 `npm ci` 재실행.
- 포트 사용 중: Vite가 표시한 실제 주소 확인.
- 브라우저 테스트 실패: Google Chrome 설치와 기존 개발 서버 상태 확인.
- 첨부·저장 실패: 파일 크기와 브라우저 저장 공간 확인.
