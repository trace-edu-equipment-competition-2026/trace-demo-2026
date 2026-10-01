---
name: "TRACE"
description: "녹색 내비게이션·민트 선택·의미별 작업 영역을 갖춘 한국어 교육 작업실."
colors:
  primary: "#2b6f60"
  primary-hover: "#235d50"
  mint: "#54b3a6"
  mint-soft: "#cfefea"
  rose-soft: "#f0dddd"
  yellow-soft: "#f8edcc"
  lavender-soft: "#e4e1f6"
  rose: "#d9807a"
  yellow: "#d4b763"
  lavender: "#837abd"
  chart-charcoal: "#484b47"
  background: "#f2f3ee"
  surface: "#fff"
  foreground: "#3b3d3b"
  supporting-text: "#606d64"
  placeholder-text: "#667065"
  heading-text: "#244e45"
  context-surface: "#eef6f2"
  input-surface: "#f6f7f4"
  ai-surface: "#f0eef8"
  attention-surface: "#fbf4de"
  execution-surface: "#273b35"
  navigation-selected: "#edfff5"
  sidebar-foreground: "#edfff5"
  border: "#e6e8e5"
  field-border: "#e1e5df"
  panel-border: "#e7e9e5"
typography:
  headline:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "32px"
    fontWeight: 750
    lineHeight: 1.25
    letterSpacing: "-.03em"
  title:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "20px"
    fontWeight: 750
    lineHeight: 1.4
    letterSpacing: "-.025em"
  body:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "15px"
    lineHeight: 1.6
  control:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "14px"
    lineHeight: 1.45
  label:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  supporting:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "12px"
  metric:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "26px"
    fontWeight: 750
    lineHeight: 1.4
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "14px"
    lineHeight: 1.8
rounded:
  control: "10px"
  button: "11px"
  navigation: "12px"
  section-symbol: "12px"
  panel: "18px"
  panel-compact: "18px"
spacing:
  field-gap: "8px"
  action-gap: "10px"
  group-gap: "12px"
  field-margin: "18px"
  section-gap: "22px"
  panel-padding: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "#525d50"
    rounded: "{rounded.button}"
    padding: "12px 20px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "#3b423c"
    rounded: "{rounded.control}"
    padding: "11px 13px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "24px"
  navigation-active:
    backgroundColor: "{colors.navigation-selected}"
    textColor: "{colors.primary}"
    rounded: "{rounded.navigation}"
    padding: "8px 10px"
  goal-chip:
    backgroundColor: "{colors.mint-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
  section-symbol:
    backgroundColor: "{colors.mint-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.section-symbol}"
    size: "38px"
  review-tab-selected:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    padding: "12px 18px"
    height: "48px"
---

# TRACE 디자인 기준

## 공통 구성

사용자 대시보드·사이드바 이미지 기준. 짙은 녹색 내비게이션, 회백색 배경, 흰 둥근 패널, 민트 선택 상태.
네트워크·융합은 같은 화면·카드·입력폼 사용. `src/index.css`, `src/app.css`, `src/workspace.css` 참조.
세부 화면 기준: `docs/design-brief.md`.

## 색상

- 주요 동작: 짙은 녹색. 활성 사이드바: 옅은 민트 바탕·녹색 글자.
- 평가 기준·증거 선택: 흰 바탕·녹색 테두리. 상세 탭: 녹색 밑줄.
- 맥락: `context-surface`. 교수자 입력: `input-surface`. AI 해석: `ai-surface`.
- 확인 필요: `attention-surface`. 원출력: 어두운 `execution-surface`.
- 차트 범주: 민트·보라·노랑·코랄·차콜. 필터 변경 후에도 과제별 색상 유지.
- L1 민트 / L2 보라 / L3 노랑 / L4 코랄. 수준 이름·값 함께 표시. 지원량을 능력 점수로 표현 금지.

## 글자

상단 토큰의 한국어 글꼴·역할별 크기 사용. 페이지 제목·섹션 제목·본문·보조 정보 구분.
페이지 제목: 기본 32px, 900px 이하 28px, 600px 이하 26px.
섹션 제목: 20px, 600px 이하 18px. 주요 근거·입력·검토 조작: 14px.
시간·출처·건수: 12px. 원출력: 고정폭 14px / 줄높이 1.8. 한국어 줄바꿈·긴 값 넘침 확인.

## 배치

사이드바: 기본 272px, 1600px 이상 290px, 1250px 이하 240px.
1050px 이하: 272px 서랍형 메뉴·배경 가림. 데스크톱 메뉴 접기·다시 열기 지원.
본문 최대 너비 1740px. 패널 간격 기본 24px, 900px 이하 22px, 600px 이하 18px.
평가 작업대: 기준·근거를 나란히 배치. 1100px 이하 세로 배치, 650px 이하 한 열.
학생 첫 화면: 현재 작업·최근 실행 우선. 이후 팀원·자료·교수자 지도.
세부 배치·정확한 값은 해당 CSS와 화면 문서 확인.

## 상태·접근성

원자료·학생 설명·AI 해석·교수자 확인 구분. 자료 누락은 추가 확인 또는 산정 대기로 표시.
실제 AI·자동 채점·실제 실행으로 오인할 문구 금지. 개인 대화 원문은 교수자에게 제외.
키보드 포커스·터치 대상·색 대비·모션 감소 확인. 색상만으로 상태 전달 금지.
대화상자 제목·닫기·Escape·포커스 복귀 확인. 좁은 화면에서 가로 넘침 방지.

## 변경 기준

기존 토큰·공통 컴포넌트 우선. 장식용 카드·그라데이션·그림 추가 지양.
제품 범위 변경은 `PRODUCT.md`, 시각 기준 변경은 이 문서와 `.impeccable/design.json`에 반영.
코드·화면 검증 결과 없이 완료 선언 금지.
