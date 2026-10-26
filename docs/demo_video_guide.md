# TRACE 7분 발표 및 3분 시연(HOW) PPT 슬라이드·GIF·대본 가이드

> [!IMPORTANT]
> **검토 피드백 반영 완료 (`dev` 브랜치)**
> - **수정 1 (P0 수용 — 교수자 정답·학생 안내 분리)**: [`AssignmentProposalPanel.tsx`](../src/features/teacher/AssignmentProposalPanel.tsx)에서 학생에게 공개되는 과제 설명(`description` → 학생 `brief`)에는 증상과 수행 목표만 남기고, 잘못된 Next Hop(`10.0.0.9`)과 복구 정답(`10.0.0.1`)은 **`교수자 전용 주입 장애·정답 기준 (학생 비공개)`** 박스로 완전 분리했습니다.
> - **수정 2 (P0 수용 — 물리 Link Up과 논리 End-to-End 상태 분리)**: [`PacketTracerTopology.tsx`](../src/features/student/PacketTracerTopology.tsx)에서 R1–R2 WAN 구간 물리 링크와 포트 LED는 **정상 연결(초록/청록 Link Up)** 으로 표시하고, 중앙 상단에 **`⚠ End-to-End 통신 실패 (논리 경로 점검)` → `✓ 통신 검증 성공 (양방향 정적 경로 정상)`** 논리 상태 배지를 분리했습니다.
> - **수정 3 (P0 수용 — Cisco IOS 표준 복구 절차 통일)**: CLI 진단·복구 캡처([`04a-cli-diagnosis-crop.png`](./screenshots/demo/04a-cli-diagnosis-crop.png), [`gif-03-student-cli-recovery.gif`](./screenshots/demo/gif-03-student-cli-recovery.gif))에 `show running-config` → `show ip route` → `no ip route 192.168.10.0 255.255.255.0 10.0.0.9` → `ip route 192.168.10.0 255.255.255.0 10.0.0.1` → `show ip route` → 양방향 `ping` 순서를 모두 반영했습니다.
> - **수정 4 (P1 수용 — 4단 학습 증거 2분할 및 팝오버 상단 잘림 제거)**: 세로로 긴 4단 학습 증거 카드를 16:9 슬라이드에 맞게 **학생 수행 기록([`06a1-evidence-student-crop.png`](./screenshots/demo/06a1-evidence-student-crop.png))** 과 **AI 요약·교수자 확인([`06a2-evidence-teacher-crop.png`](./screenshots/demo/06a2-evidence-teacher-crop.png))** 2장으로 분할하고, [`LabAiAssistant.tsx`](../src/features/student/LabAiAssistant.tsx) 팝오버 상단의 이전 대화 잘림 현상을 제거했습니다.
> - **수정 5 (P0 부분 수용/조정 — 개인 실습 일관성 유지 및 투 트랙 E2E 보존)**: 네트워크 트랙 과제 제안 배지의 `팀 프로젝트` 표기를 **`개인 실습`** 으로 수정했습니다([`02a-triptych-crop.png`](./screenshots/demo/02a-triptych-crop.png)). 단, 논문 투 트랙 구조와 기존 E2E 회귀 테스트 호환을 위해 공통 네비게이션 명칭은 유지하되, PPT 시연에서는 **개인 실습 관찰 테이블([`05a-student-table-crop.png`](./screenshots/demo/05a-student-table-crop.png))** 만 확대 사용합니다.
> - **수정 6 (P1 수용 — 7분 전체 발표 구조·매체 혼합·예상 Q&A 보강)**: 본 문서에 7분 전체 발표 타임라인, PNG 기본 + 핵심 GIF 2종 운용 전략, 교육과정–학습증거 대응표, 심사위원 예상 Q&A를 통합했습니다.

---

## 1. 7분 전체 발표 권장 구성 및 매체 운용 원칙

### 1-1. 7분 발표 타임라인 (4분 연구 배경·모델 + 3분 HOW 시연)

| 순서 | 시간 | 발표 구간 | 핵심 메시지 | 권장 시각 자료 |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `0:00–0:45` (45초) | **문제제기 (WHY)** | 학생은 AI에게 정답을 바로 요구하고, 교수자는 결과물만 보고 학생의 실제 이해 과정을 확인하기 어려움 | 기존 PPT 문제제기 슬라이드 |
| **2** | `0:45–1:25` (40초) | **적용 맥락** | 2022 개정 교육과정(2026학년도 고2 적용) 직업계고 정보통신과 「컴퓨터 네트워크」 정적 라우팅 실습 | [`01a-lesson-card-crop.png`](./screenshots/demo/01a-lesson-card-crop.png) |
| **3** | `1:25–2:10` (45초) | **TRACE 핵심 구조 (WHAT)** | ① 교육과정 기반 과제·정책 설계 → ② 정답 유보형 AI 코칭 → ③ CLI·토폴로지 실습 검증 → ④ 4단 학습 증거 평가 | TRACE 4단계 개념도 |
| **4** | `2:10–2:50` (40초) | **시연 1 (`HOW ①`)** | **학습자 직면 문제**: 정답 요구 유혹 → 1초 생각 애니메이션 후 정답 대신 게이트웨이·라우팅 점검 순서 안내 | **[`gif-02a-ai-popover-closeup.gif`](./screenshots/demo/gif-02a-ai-popover-closeup.gif)** + [`03b`](./screenshots/demo/03b-ai-popover-q1-crop.png), [`03c`](./screenshots/demo/03c-ai-popover-q2-crop.png) |
| **5** | `2:50–3:40` (50초) | **시연 2 (`HOW ②`)** | **학생 스스로 진단·복구**: `show running-config`·`show ip route` 비교 → `no ip route` 제거 → `10.0.0.1` 복구 → 양방향 Ping | **[`gif-03-student-cli-recovery.gif`](./screenshots/demo/gif-03-student-cli-recovery.gif)** + [`04a`](./screenshots/demo/04a-cli-diagnosis-crop.png), [`04b`](./screenshots/demo/04b-topology-fixed-crop.png) |
| **6** | `3:40–4:25` (45초) | **시연 3 (`HOW ③`)** | **교수자 과제·AI 정책 설계**: 교육과정+NCS 연계 과제 생성(학생 안내와 교수자 정답 분리) 및 4단계 지원 정책 | [`02a-triptych-crop.png`](./screenshots/demo/02a-triptych-crop.png) + [`02b-ai-policy-crop.png`](./screenshots/demo/02b-ai-policy-crop.png) |
| **7** | `4:25–5:05` (40초) | **시연 4 (`HOW ④`)** | **학습 증거 기반 평가**: 학생 수행 원자료·판단 근거(`①·②`)와 AI 지원 요약·교수자 확인(`③·④`)을 대조해 평가 완료 | [`06a1-evidence-student-crop.png`](./screenshots/demo/06a1-evidence-student-crop.png) + [`06a2-evidence-teacher-crop.png`](./screenshots/demo/06a2-evidence-teacher-crop.png) |
| **8** | `5:05–6:00` (55초) | **차별성 요약** | 일반 생성형 AI(정답 즉시 제시) vs 일반 LMS(결과 파일 제출) vs **TRACE(교수자 정책 + AI 코칭 + 수행 증거 통합)** | 교육과정–학습증거 대응표 (3장 참고) |
| **9** | `6:00–7:00` (60초) | **구현 범위·확장성** | 규칙 기반 프로토타입의 검증 범위와 실제 LLM·실습 장비 로그·타 실습 교과 확장 방향 | 결론 슬라이드 |

### 1-2. PPT 매체 혼합 원칙 (PNG 기본 + 핵심 GIF 2종)

> [!TIP]
> **발표 시선 분산을 막는 매체 조합**
> - 모든 슬라이드에 GIF를 넣으면 심사위원이 작은 글씨를 읽지 못합니다.
> - **기본 설명용은 고해상도 부분 확대 PNG**를 사용하고, **시간에 따른 상호작용이 핵심인 2개 장면(`HOW ①` AI 코칭 전환, `HOW ②` CLI 복구·검증)** 에만 GIF를 배치하는 구성이 가장 효과적입니다.

---

## 2. 3분 시연 구간 (`HOW ① ~ ④`) 슬라이드별 구성 및 대본

### 슬라이드 1 (`HOW ①` · 40초): 학습자 직면 문제 — 정답 요구를 스스로 탐색으로 전환

#### ① 권장 배치 (핵심 GIF 1종 + 정적 확대 컷 3종)
````carousel
![실습 화면 우측 하단 1:1 개인 AI 지원 클로즈업 GIF](./screenshots/demo/gif-02a-ai-popover-closeup.gif)
<!-- slide -->
![AI 답변 준비 중 상태 (1초 생각 애니메이션)](./screenshots/demo/03b0-ai-thinking-crop.png)
<!-- slide -->
![1차 질문: 정답 대신 게이트웨이·라우팅 점검 순서 안내](./screenshots/demo/03b-ai-popover-q1-crop.png)
<!-- slide -->
![2차 질문: R2 반환 경로와 Next Hop 도달 가능성 확인 질문](./screenshots/demo/03c-ai-popover-q2-crop.png)
````

#### ② 보조 이미지 (물리 Link Up vs 논리 End-to-End 통신 실패 토폴로지)
![물리 링크 정상 · 논리 End-to-End 통신 실패 토폴로지](./screenshots/demo/03a-topology-fault-crop.png)

#### ③ 발표 대본 (40초)
> "먼저 학생이 실습 중 마주하는 장면입니다. 본사 `PC-A`에서 지사 `PC-B`로 통신이 되지 않자, 학생은 우측 하단 **1:1 개인 AI 지원** 창을 열어 *'통신이 안 되는데 정답 명령어를 바로 알려달라'* 고 요청합니다.
> 일반 생성형 AI라면 즉시 `ip route` 정답을 출력하겠지만, TRACE의 AI는 잠시 학습 맥락을 확인한 뒤 **정답 명령어를 유보**하고 기본 게이트웨이 Ping과 라우팅 테이블 중 무엇부터 확인해야 할지 탐색 순서를 먼저 질문합니다.
> 이어서 학생이 게이트웨이까지는 응답이 오지만 지사 PC가 실패한다고 답하면, AI는 **반대 방향인 R2의 반환 경로와 Next Hop 도달 가능성**을 스스로 점검하도록 유도합니다."

---

### 슬라이드 2 (`HOW ②` · 50초): 학생의 판단·복구·검증 — CLI 원자료와 논리 통신 복구

#### ① 권장 배치 (핵심 GIF 1종 + 정적 확대 컷 3종)
````carousel
![학생 CLI 진단 → no ip route 제거 → 10.0.0.1 복구 → 양방향 Ping 검증 GIF](./screenshots/demo/gif-03-student-cli-recovery.gif)
<!-- slide -->
![CLI 진단·제거(no ip route)·복구·양방향 Ping 로그 확대](./screenshots/demo/04a-cli-diagnosis-crop.png)
<!-- slide -->
![복구 완료 후 논리 End-to-End 통신 검증 성공 토폴로지](./screenshots/demo/04b-topology-fixed-crop.png)
<!-- slide -->
![학생의 판단 근거 서술 및 학습 증거 기록](./screenshots/demo/04c-student-reflection-crop.png)
````

#### ② 발표 대본 (50초)
> "AI의 안내에 따라 학생은 스스로 CLI 진단을 수행합니다.
> `R2`에서 `show running-config`와 `show ip route`를 비교해 본 결과, 물리적인 WAN 링크는 정상이지만 정적 경로의 Next Hop이 `10.0.0.0/30` 대역 밖인 `10.0.0.9`로 잘못 설정되어 활성 라우팅 테이블(RIB)에 설치되지 않은 원인을 찾아냅니다.
> 학생은 실제 Cisco IOS 절차에 따라 `no ip route 192.168.10.0 255.255.255.0 10.0.0.9`로 잘못된 경로를 제거하고, `10.0.0.1`로 정적 경로를 다시 설정한 뒤 `show ip route`와 `PC-A`, `PC-B` 양방향 Ping 성공을 검증합니다.
> 마지막으로 왜 그렇게 판단했는지 자신의 언어로 기록하면, 실행 로그와 판단 근거가 하나의 학습 증거로 저장됩니다."

---

### 슬라이드 3 (`HOW ③` · 45초): 교수자의 과제·AI 정책 설계 — 왜 AI가 정답을 멈추었는가

#### ① 권장 배치 (정적 확대 컷 3종 — 슬라이드 기본 / 보조 GIF 1종)
````carousel
![2026학년도 2학기 고2 컴퓨터 네트워크 8주차 수업 카드](./screenshots/demo/01a-lesson-card-crop.png)
<!-- slide -->
![교육과정 + NCS 연계 AI 과제 제안 (학생 안내와 교수자 전용 정답 분리 · 개인 실습)](./screenshots/demo/02a-triptych-crop.png)
<!-- slide -->
![교수자 AI 운영 방식 및 4단계 지원 수준(확인 질문~도구 활용 힌트) 설정](./screenshots/demo/02b-ai-policy-crop.png)
````

#### ② 발표 대본 (45초)
> "그렇다면 앞선 장면에서 AI는 왜 정답을 바로 주지 않았을까요? 교수자가 수업을 시작할 때 설계한 **과제 구조와 AI 운영 정책** 때문입니다.
> 본 시연은 2022 개정 교육과정이 적용되는 고등학교 2학년 「컴퓨터 네트워크」 8주차 개인 실습 수업으로 설정했습니다.
> 교수자가 교육과정 성취기준과 NCS 직무 요소를 선택하면 AI가 실습 과제를 제안하는데, 이때 **학생에게 공개되는 과제 안내문**에는 장애 증상과 검증 목표만 제시되고, 주입한 오류(`10.0.0.9`)와 복구 정답(`10.0.0.1`)은 **교수자 전용 기준**으로 분리됩니다.
> 또한 교수자가 AI 지원 범위를 확인 질문과 탐색 힌트 중심으로 설정했기 때문에, 학생 화면의 AI가 정답 제시를 멈추고 코칭을 수행한 것입니다."

---

### 슬라이드 4 (`HOW ④` · 40초): 학습 증거 기반 평가 — 4단 학습 증거 2분할 확인

#### ① 권장 배치 (16:9 가독성을 위해 분할한 정적 확대 컷 3종)
````carousel
![1인 실습 관찰 테이블: 학생별 진행 상태·AI 개입 신호 요약](./screenshots/demo/05a-student-table-crop.png)
<!-- slide -->
![학습 증거 상단 (① 실제 실행 기록 원자료 + ② 학생의 판단 기록)](./screenshots/demo/06a1-evidence-student-crop.png)
<!-- slide -->
![학습 증거 하단 (③ AI 지원 정보 요약 + ④ 교수자 수행 인정·지도 메모)](./screenshots/demo/06a2-evidence-teacher-crop.png)
````

#### ② 발표 대본 (40초)
> "마지막으로 교수자의 학습 증거 평가 화면입니다.
> 교수자는 개별 학생 관찰 표에서 각 학생이 어느 단계에 머물러 있는지와 AI 지원 요약 신호를 한눈에 파악합니다.
> 유송민 학생의 학습 증거를 열면, 상단에는 **① 학생이 실제로 실행한 CLI 명령·출력 원자료**와 **② 학생 자신이 작성한 판단 근거**가 제시되고, 하단에는 **③ AI가 어떤 힌트 수준으로 개입했는지 요약 정보**와 **④ 교수자의 최종 수행 인정 및 지도 메모**가 나란히 놓입니다.
> 즉, 교수자는 단순 결과 파일이 아니라 *'학생이 어떤 AI 지원을 받아 스스로 문제를 해결했는가'* 를 검증하여 평가를 마무리합니다."

---

## 3. 교육과정 목표 ↔ 학생 수행 증거 ↔ 교수자 확인 대응표

PPT의 시연 요약 슬라이드나 발표 후반부(차별성 정리)에 바로 넣을 수 있는 대응표입니다.

| 교육과정·수업 설계 목표 (교수자 설정) | 학생 수행 증거 (원자료 + 판단 기록) | AI 지원·해석 요약 | 교수자 최종 확인 기준 |
| :--- | :--- | :--- | :--- |
| **장애 구간 분리**<br>End-to-End 통신 실패 시 LAN 구간과 원격 구간을 구분 | `PC-A> ping 192.168.10.1` (성공)<br>`PC-A> ping 192.168.20.10` (100% loss) | **확인 질문 / 탐색 방향 안내**<br>정답 명령어 유보, 게이트웨이·라우팅 테이블 점검 순서 유도 | 기본 게이트웨이 정상 여부를 먼저 확인해 장애 범위를 좁혔는가 |
| **라우팅 설정과 RIB 비교 분석**<br>설정된 정적 경로와 실제 활성 경로의 차이 파악 | `R2> show running-config`<br>`R2> show ip route` (`10.0.0.9` 도달 불가로 RIB 미설치 확인) | **개념 힌트**<br>왕복 통신 조건 및 R2 반환 경로의 Next Hop 도달 가능성 질문 | `running-config`의 오설정 경로가 왜 `show ip route`(RIB)에 올라오지 않는지 설명했는가 |
| **정적 경로 수정 및 양방향 검증**<br>오류 경로 제거 후 올바른 Next Hop 설정·검증 | `R2> no ip route ... 10.0.0.9`<br>`R2> ip route ... 10.0.0.1`<br>`PC-A`·`PC-B` 양방향 `ping` (0% loss) | **도구 활용 힌트**<br>수정 전후 명령 비교 및 양방향 검증 체크리스트 연동 | `no ip route` 제거 후 `10.0.0.1` 복구 및 양방향 Ping 성공을 모두 입증했는가 |

---

## 4. 프로토타입 구현 범위 및 심사위원 예상 Q&A

### 4-1. 정직한 구현 범위 안내 (발표 시 권장 표현)
- 본 데모는 **교수자의 AI 정책 설정 → 학생 맞춤형 코칭 → CLI 실습 검증 → 4단 학습 증거 수집·평가**로 이어지는 교육모델의 작동 구조를 검증하기 위해 제작한 **규칙 기반(Rule-based) 인터랙티브 프로토타입**입니다.
- 시연 중 제시되는 AI 응답과 CLI 출력은 직업계고 네트워크 실습 시나리오에 맞춰 구조화된 시뮬레이션 응답이며, 향후 실제 LLM API 및 실습 장비(Packet Tracer / GNS3 등) 로그 수집 파이프라인으로 확장할 수 있도록 도메인 계층(`src/domain/`)을 분리해 설계했습니다.

### 4-2. 심사위원 예상 질문 및 답변 가이드

| 예상 질문 | 핵심 답변 요약 |
| :--- | :--- |
| **Q1. 일반 ChatGPT를 쓰는 것과 무엇이 다른가요?** | 일반 챗봇은 학생이 물으면 정답 명령어(`ip route ...`)를 바로 출력해 실습 목적을 무너뜨립니다. TRACE는 **교수자가 설정한 차시 목표와 지원 단계 정책**에 따라 정답을 유보하고, 학생의 현재 CLI 실습 상태에 맞춘 확인 질문과 탐색 힌트를 제공합니다. |
| **Q2. 교수자가 학생의 AI 대화 전문을 일일이 다 읽어야 하나요?** | 아닙니다. 학생에게는 평가 부담을 주지 않도록 지원 단계 라벨(`L1~L4`)을 숨기되, 교수자에게는 대화 원문 전체 대신 **지원 수준 분포와 핵심 개입 요약**을 실행 로그·학생 설명과 함께 4단 카드로 압축해 보여줍니다. |
| **Q3. 왜 물리 링크는 초록색인데 통신 실패라고 표시되나요?** | 실제 라우팅 장애 교육에서 가장 중요한 구분이 **물리 계층(Link Up)과 네트워크 계층(라우팅 테이블 미설치)의 분리**이기 때문입니다. 케이블과 인터페이스는 정상(초록 LED)이지만 잘못된 Next Hop(`10.0.0.9`) 때문에 논리 경로가 끊긴 상황을 정확히 표현했습니다. |
| **Q4. 네트워크 외에 다른 교과에도 적용 가능한가요?** | 네. 코드 구조상 교과 데이터·시뮬레이션(`src/domain/`)과 학습 워크스페이스·증거 구조(`src/features/`)를 분리했습니다. 동일한 4단 학습 증거 구조(실행 원자료 + 학생 판단 + AI 지원 요약 + 교수자 확인)를 프로그래밍, 과학 실험, IoT 융합 실습에 그대로 적용할 수 있습니다. |

---

## 5. 전체 이미지(PNG) 및 애니메이션(GIF) 파일 목록

모든 파일은 [`docs/screenshots/demo/`](./screenshots/demo/)에 저장되어 있습니다.

### 5-1. 애니메이션 GIF (5종 — 핵심 2종 권장)
| 구분 | 파일 경로 | 설명 |
| :--- | :--- | :--- |
| **핵심 권장 1** | [`./screenshots/demo/gif-02a-ai-popover-closeup.gif`](./screenshots/demo/gif-02a-ai-popover-closeup.gif) | 우측 하단 1:1 AI 팝오버 클로즈업 (`답변 준비 중...` 1초 애니메이션 + 스트리밍 코칭) |
| **핵심 권장 2** | [`./screenshots/demo/gif-03-student-cli-recovery.gif`](./screenshots/demo/gif-03-student-cli-recovery.gif) | `show running-config` → `show ip route` → `no ip route` → `ip route` → 양방향 Ping 복구 |
| 보조 | [`./screenshots/demo/gif-02-student-ai-coaching.gif`](./screenshots/demo/gif-02-student-ai-coaching.gif) | 학생 실습 전체 화면에서 1:1 AI 팝오버 열기 및 코칭 상호작용 |
| 보조 | [`./screenshots/demo/gif-01-teacher-setup.gif`](./screenshots/demo/gif-01-teacher-setup.gif) | 교수자 대시보드 → 과제 설계 및 AI 운영 정책 설정 흐름 |
| 보조 | [`./screenshots/demo/gif-04-teacher-evidence-review.gif`](./screenshots/demo/gif-04-teacher-evidence-review.gif) | 교수자 관찰 테이블 → 4단 학습 증거 확인 및 지도 노트 작성 |

### 5-2. 고해상도 정적 PNG (18종)
| 구간 | 파일 경로 | 설명 |
| :--- | :--- | :--- |
| **`HOW ①`** | [`./screenshots/demo/03a-topology-fault-crop.png`](./screenshots/demo/03a-topology-fault-crop.png) | 물리 Link Up + 논리 `⚠ End-to-End 통신 실패` 배지가 분리된 초기 토폴로지 |
| **`HOW ①`** | [`./screenshots/demo/03b0-ai-thinking-crop.png`](./screenshots/demo/03b0-ai-thinking-crop.png) | AI `답변 준비 중...` 생각 애니메이션 캡처 |
| **`HOW ①`** | [`./screenshots/demo/03b-ai-popover-q1-crop.png`](./screenshots/demo/03b-ai-popover-q1-crop.png) | 1차 질문 응답 (상단 잘림 없음 · 정답 유보 및 탐색 순서 안내) |
| **`HOW ①`** | [`./screenshots/demo/03c-ai-popover-q2-crop.png`](./screenshots/demo/03c-ai-popover-q2-crop.png) | 2차 질문 응답 (상단 잘림 없음 · R2 반환 경로 점검 유도) |
| **`HOW ①`** | [`./screenshots/demo/03-student-lab-full.png`](./screenshots/demo/03-student-lab-full.png) | 학생 실습실 + 우측 하단 1:1 AI 팝오버 전체 화면 |
| **`HOW ②`** | [`./screenshots/demo/04a-cli-diagnosis-crop.png`](./screenshots/demo/04a-cli-diagnosis-crop.png) | `no ip route 10.0.0.9` 제거 → `10.0.0.1` 추가 → `show ip route` → 양방향 Ping CLI 로그 |
| **`HOW ②`** | [`./screenshots/demo/04b-topology-fixed-crop.png`](./screenshots/demo/04b-topology-fixed-crop.png) | 복구 후 `✓ 통신 검증 성공 (양방향 정적 경로 정상)` 토폴로지 |
| **`HOW ②`** | [`./screenshots/demo/04c-student-reflection-crop.png`](./screenshots/demo/04c-student-reflection-crop.png) | 학생 판단 근거 기록 카드 |
| **`HOW ③`** | [`./screenshots/demo/01a-lesson-card-crop.png`](./screenshots/demo/01a-lesson-card-crop.png) | 2026학년도 2학기 고2 컴퓨터 네트워크 8주차 수업 배너 |
| **`HOW ③`** | [`./screenshots/demo/02a-triptych-crop.png`](./screenshots/demo/02a-triptych-crop.png) | 교육과정+NCS 과제 제안 (학생 공개 설명과 교수자 전용 정답 분리 · `개인 실습` 배지) |
| **`HOW ③`** | [`./screenshots/demo/02b-ai-policy-crop.png`](./screenshots/demo/02b-ai-policy-crop.png) | 교수자 AI 운영 방식 및 4단계 지원 수준 설정 |
| **`HOW ③`** | [`./screenshots/demo/01-dashboard-full.png`](./screenshots/demo/01-dashboard-full.png) | 교수자 수업 대시보드 전체 화면 |
| **`HOW ③`** | [`./screenshots/demo/02-assignment-full.png`](./screenshots/demo/02-assignment-full.png) | 교수자 차시 과제 설계 전체 화면 |
| **`HOW ④`** | [`./screenshots/demo/05a-student-table-crop.png`](./screenshots/demo/05a-student-table-crop.png) | 학생별 진행 상태와 개입 신호 (1인 실습 관찰 표) |
| **`HOW ④`** | [`./screenshots/demo/06a1-evidence-student-crop.png`](./screenshots/demo/06a1-evidence-student-crop.png) | **분할 상단**: ① 실제 실행 기록(원자료) + ② 학생의 판단 기록 |
| **`HOW ④`** | [`./screenshots/demo/06a2-evidence-teacher-crop.png`](./screenshots/demo/06a2-evidence-teacher-crop.png) | **분할 하단**: ③ AI 지원 정보 요약 + ④ 교수자 수행 인정·지도 메모 |
| **`HOW ④`** | [`./screenshots/demo/06a-evidence-4layers-crop.png`](./screenshots/demo/06a-evidence-4layers-crop.png) | 4단 학습 증거 통합본 (문서 참고용) |
| **`HOW ④`** | [`./screenshots/demo/06b-guidance-note-crop.png`](./screenshots/demo/06b-guidance-note-crop.png) | AI 추천 지도 노트 및 교수자 평가 피드백 |
