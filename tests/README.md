# 검증 안내

루트에서 `npm test`. Google Chrome 필요. Playwright가 개발 서버 자동 시작.
전체 타입·린트·빌드: `npm run check`.

| 파일 | 검증 대상 |
| --- | --- |
| `assignment.spec.ts` | 과제 생성·미리보기 |
| `course.spec.ts` | 과목 설정·가져오기·대시보드 |
| `student.spec.ts`, `fusion.spec.ts` | 학생·융합 흐름 |
| `guidance-record.spec.ts` | 실제 답변별 기록 폼·초안·저장·새 대화·접는 시연·패널 정렬 |
| `navigation.spec.ts` | 탭·메뉴 왕복 시 이전 화면 제거·콘솔 오류·초안 보존·이동 포커스·태블릿 역할 전환 |
| `teaching.spec.ts`, `evidence.spec.ts` | 교수자 검토·증거 |
| `learning-loop.spec.ts`, `loop-rules.spec.ts` | 학습 순환·규칙 |
| `situation-guidance.spec.ts`, `team-guidance.spec.ts` | 상황 판단·팀 지원 |
| `detail-polish.spec.ts`, `button-contrast.spec.ts` | 세부 화면·글자 대비 |

특정 파일: `npx playwright test tests/course.spec.ts`.
설정: `../playwright.config.ts`. 순차 실행. 기본 화면 1440×1080.
화면 캡처: `.impeccable/review/`. 결과: `test-results/`. 생성물 커밋 제외.
실패 시 기대 동작·화면 상태·저장 데이터 확인. 테스트를 통과시키기 위한 검증 삭제 금지.
