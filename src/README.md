# 앱 코드

| 파일 | 역할 |
| --- | --- |
| `main.tsx`, `App.tsx` | 앱 시작·역할·시나리오·과제 상태 |
| `WorkspaceContext.tsx`, `WorkspaceSidebar.tsx`, `navigation.ts`, `ProfileSwitch.tsx` | 공통 문맥·사이드바·메뉴·프로필 |
| `CourseDashboard.tsx`, `CourseSettings.tsx`, `course.ts` | 수업 요약·과목 설정·기본값 |
| `TeachingWorkspace.tsx`, `EvidenceReview.tsx`, `TeachingCharts.tsx`, `MonitoringMap.tsx` | 평가·증거·차트·팀 모니터링 |
| `StudentWorkspace.tsx`, `ProjectSimulation.tsx`, `TeamDocuments.tsx` | 학생 화면·모의 실행·팀 자료 |
| `LearningCycle.tsx`, `learningLoop.ts`, `GuidanceDemo.tsx` | 지원 정책·판단·추가 상황·학습 순환 |
| `scenarios.ts`, `fusion.ts`, `student.ts` | 네트워크·융합 데이터·프로젝트 저장 |
| `assignment.ts`, `student.ts`, `evidence.ts`, `observations.ts`, `demoSources.ts` | 과제·지원·평가 예시·원자료 |
| `ExecutionEnvironment.tsx`, `StudentPreview.tsx`, `TeamBuilder.tsx`, `OptionEditor.tsx`, `SectionTitle.tsx` | 과제 설계 보조 화면 |
| `*.css` | 공통·화면별 스타일 |

화면 수정: 해당 컴포넌트와 연결 CSS 확인. 데이터 수정: `scenarios.ts`와 관련 모듈 확인.
네트워크·융합 공통 화면 유지. 저장 구조 변경 시 기존 데이터 이전 검토.
검증: 루트에서 `npm run check`. 기능 변경 시 관련 `tests/` 실행.
