# Shared student workspace contract

Both **2학년 네트워크 실습** and **융합 팀 프로젝트** use `StudentWorkspace`, `WorkspaceSidebar`, `navigation.ts`, `KnowledgeConnections`, `ProjectSimulation`, and `TeamDocuments`. `scenarios.ts` supplies their different content. Corresponding screens, cards, fields, navigation labels, and workflows remain identical. `DESIGN.md` and `.impeccable/design.json` are preserved.

## Role and navigation

The anchored profile disclosure switches between 강병준 (teacher) and 유송민 (student, team 1); the workspace disclosure selects network or fusion. They are keyboard-operable disclosures with current-choice state, outside dismissal, and Escape handling. Profiles are demonstration roles, not authenticated accounts. The shared sidebar retains TRACE, green navigation, charcoal active rows, collapse behavior, and the tablet drawer.

| Route | Common purpose |
| --- | --- |
| `team` · 팀 대시보드 | Brief, five phases, task progress, plan, learning need, team roles, teacher guidance, knowledge connections, and resources |
| `studio` · 프로젝트 작업실 | 기획·기술 선택 → 수행 보드 → 실행 및 검증 tabs |
| `documents` · 팀 자료 | Search/filter, create/edit, attach, download, and share a resource |
| `chat` · 팀 채팅 | Team-visible local messages, shared AI guidance, and clickable shared resources |
| `ai` · 개인 AI 지원 | Private scripted guidance, current work context, and an explicit teacher-guidance request |
| `learning` · 나의 학습 기록 | Personal evidence, prior-learning gap, connections, teacher guidance, and saved assessment feedback |

Active role, route, and studio tab survive workspace switching within the app session. Reload starts with the default teacher/network context. Local form drafts and open dialogs do not have the same persistence guarantee as saved records.

## Planning, connections, and work board

The planning form has the same fields in both scenarios: name, audience, problem, minimum scope, language/command system, interface/configuration tool, processing/connection approach, collaboration tools, and the reason connecting existing/new knowledge. Saving requires every field and creates a personal design-process evidence record.

`KnowledgeConnections` shows learning source, existing knowledge, new need, application/checking action, and status. Students can add a named connection with its source and intended use from planning or learning records. Network connects address/routing/diagnosis/documentation knowledge; fusion connects prior and other coursework with the chosen program. The component and edit form are shared.

The work board has 할 일, 진행 중, 완료 columns and six scenario tasks. A nonblank action/result note completes the selected task and appends evidence attributed to 유송민. Progress is completed tasks divided by six, not a grade or proof that code ran. Recording a task does not bypass the execution panel's verification gate. Other members' activity is authored demonstration data.

## Shared execution and verification

Both scenarios use the same composition: project nodes, checking conditions, target selector, bounded command/request console, shortcuts, result checks, and written explanation before sharing. The initial exercise has two conditions and three checks; the supported extension adds a fourth check, and fusion adds a third condition. The console retains the latest 100 entries. No command runs on real equipment, the operating system, or an external API.

Network data describes PC-A `192.168.10.10` → R1 `10.0.0.1` → R2 `10.0.0.2` → PC-B `192.168.20.10`. R2 initially has the wrong next hop `10.0.0.9`. Supported route/interface inspection, the exact R2 repair `ip route 192.168.10.0 255.255.255.0 10.0.0.1`, and the two directional PC ping checks model a small diagnostic exercise. A repair resets current directional checks. Students must select the comparison/return-direction conditions and pass the route plus both directional checks.

Fusion uses `GET /schema`, `GET /status`, `TEST registered`, `TEST unknown`, and `TEST privacy`. Registered questions return an authored answer/source. Missing-source and personal-information tests depend on the abstention and masking rules. Fictional outputs do not establish real correctness or privacy protection.

Changing a condition clears current checks in both scenarios. Sharing requires all current checks, all selected conditions, and a nonblank judgment; an active extension also requires saved reanalysis and team agreement. Sharing appends an evidence record with a stable ID, learning goals, cycle, raw execution snapshot, and separate student explanation. A new `project-verification-<evidence ID>` resource and team announcement are appended. Re-sharing preserves earlier records and resources. Completing all board tasks and passing the simulated experiment remain separate concepts.

## Private support and shared guidance

The existing team-chat composer switches between 「팀 메시지」 and 「AI 가이던스」. Ordinary messages only append to the team conversation. Quick prompts for project implementation discussion, role division, workload distribution, and conflict coordination fill the composer and select guidance mode; students still submit the request explicitly. Team questions and delivered answers stay in the shared conversation. AI replies carry the 「TRACE AI」 author and 「팀 가이던스」 label on the existing lavender interpretation surface. Guidance proposes questions or steps for team agreement; it does not assign roles or change task ownership.

Team guidance and private support use the saved support policy and are delivered immediately in both automatic and instructor approval modes. Only proposals adding a preparatory step or advanced condition require situation approval; ordinary project advice and role division never enter that queue. Direct teacher mode delivers the configured guidance. 「AI 제안에 대한 나의 판단」 includes approved private proposals only, excluding team guidance. Both scenarios use this local scripted flow within the existing chat layout and context cards; no live AI or multi-user messaging service is involved.

Team messages and private AI messages use separate arrays. The student sees no L1–L4 control. Saved assignment policy and authored rules for question context, recent failure, partial checks, and shared verification choose an allowed illustrative response. Approval mode delivers ordinary guidance immediately and queues only additional problem situations; direct mode uses the saved teacher guidance. Delivered support stores a level/reason/time summary. Navigation and role switching clear unsent composer text. Responses are scripted examples, not a model service.

Teachers receive guidance summaries, hints awaiting their approval, explicit requests, and shared evidence, never private question text. In 「AI 제案에 대한 나의 판단」 students explicitly share a selected proposal with a 채택/수정/거부 decision, reason, chosen approach, and optional verification link. Students send a separate written request when they want teacher review. Saving a teacher guidance proposal for team 1 makes its text visible on the student's dashboard, support view, and learning record. A new student request makes the previous response inactive. Saved evaluation feedback for 유송민 also appears in the learning record. These interactions share local state in the selected scenario; they are not messages sent through an institutional service.

## Materials and storage

`TeamDocuments` supports text creation/editing, version counters, search/type filtering, local attachments, downloads, and chat links. File attachments are read locally into data URLs, with a 2 MiB per-file limit and a serialized student-state size check. Version numbers do not preserve historical revisions. Chat resource links open the current resource. This is not concurrent collaboration, server upload, document parsing, or cross-device synchronization.

Saved project data uses `trace-project-network-v2` or `trace-project-fusion-v2`. It includes plan, connections, tasks, evidence, experiment explanation, materials, conversations, guidance summaries, requests, and shared feedback. Legacy student/fusion keys can seed migration but are no longer the write targets. Teacher course, assignment, evidence-confirmation, and review keys are separately scoped with `workspaceKey`; see [the common scenario contract](fusion-workspace.md).

Explicit save/send/share actions distinguish drafts from saved records. Simulation rules, current checks, recent command history, and the explanation field are saved in the project state. Open dialogs, work notes, and other unsaved form input remain transient. Applied policy, support approvals, situations, and alternative-submission review status also persist locally. Browser storage failure displays a warning. Private-text separation is an interface boundary within browser storage, not server authorization.

## Visual and verification boundary

The common workspace inherits the existing palette, rounded white panels, compact Korean typography, focus states, tablet drawer, and reduced-motion behavior. Student and studio composition uses the existing student/fusion styles for both data variants. No global visual tokens change. Documentation was checked against the shared source components; runtime tests and screenshot review are separate validation work.

## Paper learning cycle

The bounded extension connects saved policy, instructor-reviewed support, explicit student judgment, separate execution snapshots, one changed-condition cycle, and external alternative review. See [the runnable Korean walkthrough and boundaries](paper-learning-cycle.md) for exact labels, supported scenario types, and how to find 유송민 · 1팀. 「임시 저장」 preserves an assignment draft; 「과제 생성」/「과제 다시 저장」 applies the student policy.

## Direction contract · paper learning cycle
THESIS: Operate. Connect instructor policy, bounded support, student judgment, source evidence and another attempt.
OWN-WORLD: Preserve the existing green sidebar, white panels, semantic surfaces, typography and responsive rules.
STORY: Guidance is immediate; the student questions it, selects an approach, verifies it and shares only the chosen judgment. The instructor approves an added problem situation before its new conditions start another attempt with earlier evidence preserved.
FIRST VIEWPORT: Keep the existing chat and monitoring composition. Approval lives in team-1 detail; student judgment follows the support conversation. The studio begins with the current situation and then the existing three tabs.
FORM: Extend incumbent panels and native disclosures. No new visual world or concept seed is required for this bounded extension.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance


추가 문제 상황은 AI가 새로운 채팅·수행 기록·학습 증거를 관찰해 판단한다. 학생은 선행·심화 단계나 상황 유형을 선택하지 않는다. 자동형은 즉시 적용하며 승인형은 교수자 검토로 전달한다. 실제 모델 호출 없이 관찰 신호를 사용하는 제한된 시연 규칙이다.
