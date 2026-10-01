# TRACE 작업 규칙

- `dev` 브랜치 사용. 사용자 변경 보존.
- 한국어 문서·주석. 짧은 명사형 문체. 명령어·식별자·도구 스키마·라이선스 원문 유지.
- UI 작업 전 `PRODUCT.md`, `DESIGN.md`, `docs/design-brief.md` 확인. 사용자 이미지 우선.
- Ponytail: `.agents/skills/ponytail/SKILL.md`. 기존 구현 재사용, 단순한 해결 우선. 요청된 화면·콘텐츠·접근성·상호작용 생략 금지.
- Impeccable: `.agents/skills/impeccable/SKILL.md`. 기존 디자인·요청 범위 유지. 이미 확정된 내용 재질문 금지.
- React + TypeScript + Vite, Tailwind CSS, shadcn/ui. 필요한 컴포넌트만 추가.
- 한국어 UI. 데스크톱·태블릿, 키보드·터치, 모션 감소, 포커스·대비 확인.
- 네트워크·융합은 동일 화면에 다른 시나리오 데이터 사용.
- 고정 예시·시연 응답 사용 가능. 실제 AI·학생 자료로 오인할 표현 금지.
- 완료 전 `npm run check`. UI 변경 시 기능·데스크톱·태블릿 가로/세로 검증.
