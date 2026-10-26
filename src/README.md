# 앱 코드 구조 (`src/`)

React + TypeScript 표준 기능·계층 분리 구조 적용.
- `.tsx`: JSX(HTML 유사 마크업)를 반환하는 **React UI 컴포넌트**
- `.ts`: UI 마크업이 없는 **순수 TypeScript 도메인 로직·상태 규칙·데이터 모듈**

| 경로 | 역할 |
| --- | --- |
| `main.tsx`, `App.tsx` | 앱 진입점·전체 쉘·역할(교수자/학생)·워크스페이스(네트워크/융합) 상태 오케스트레이션 |
| `components/layout/` | 공통 레이아웃·컨텍스트 (`WorkspaceContext.tsx`, `WorkspaceSidebar.tsx`, `ProfileSwitch.tsx`, `SectionTitle.tsx`) |
| `components/ui/` | 공통 UI 기본 컴포넌트 (`button.tsx`) |
| `features/learning/` | 교수자·학생 공유 학습 순환·추가 상황·대안 자료 검토 (`LearningCycle.tsx`) |
| `features/teacher/` | 교수자 화면 (`CourseDashboard.tsx`, `AssignmentBuilder.tsx`, `AssignmentProposalPanel.tsx`, `CourseSettings.tsx`, `TeachingWorkspace.tsx`, `EvidenceReview.tsx`, `MonitoringMap.tsx`, `TeachingCharts.tsx`, `ExecutionEnvironment.tsx`, `StudentPreview.tsx`, `TeamBuilder.tsx`, `OptionEditor.tsx`) |
| `features/student/` | 학생 화면 (`StudentWorkspace.tsx`, `ProjectSimulation.tsx`, `PacketTracerTopology.tsx`, `LabAiAssistant.tsx`, `StudentChat.tsx`, `ChatRecord.tsx`, `GuidanceDemo.tsx`, `TeamDocuments.tsx`) |
| `domain/` | 순수 비즈니스 로직·상태 규칙·시나리오 데이터 (`scenarios.ts`, `course.ts`, `assignment.ts`, `simulationEngine.ts`, `learningLoop.ts`, `evidence.ts`, `observations.ts`, `student.ts`, `fusion.ts`, `demoSources.ts`, `navigation.ts`) |
| `styles/` | 공통·화면별 스타일시트 (`app.css`, `workspace.css`, `course.css`, `teaching.css`, `student.css`, `fusion.css`, `guidance-demo.css`) |
| `lib/` | 범용 유틸리티 (`utils.ts`) |

화면 수정: `features/` 또는 `components/` 컴포넌트와 `styles/` CSS 확인. 데이터·규칙 수정: `domain/` 모듈 확인.
네트워크·융합 투트랙 공통 화면 유지. 저장 구조 변경 시 기존 데이터 이전 검토.
검증: 루트에서 `npm run check`. 기능 변경 시 관련 `tests/` 실행.
