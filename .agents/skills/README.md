# 프로젝트 스킬

| 스킬 | 용도 | 원본 |
| --- | --- | --- |
| Ponytail | 기존 코드 재사용·최소 구현·의존성 절제 | `ponytail/SKILL.md` |
| Impeccable | 디자인 판단·화면 검토·접근성·반응형 | `impeccable/SKILL.md` |

앱 실행에 별도 설치 불필요. 에이전트가 저장소를 열면 로컬 스킬 확인.
미인식 시 경로 직접 지정 후 읽기 요청. 외부 도구 문서·스크립트·라이선스 원본 유지.

### Ponytail

`Ponytail full로 수정` 요청. 단계: `lite` / `full`(기본) / `ultra`.
기존 코드 → 표준 기능 → 이미 설치한 라이브러리 → 최소 구현 순서.
요청 기능·입력 검증·보안·접근성 생략 금지. 종료: `stop ponytail` 또는 `normal mode`.

### Impeccable

UI 변경 전 `PRODUCT.md`, `DESIGN.md`, 관련 화면 문서·레퍼런스 확인.
예: `Impeccable audit로 학생 작업실 검토`, `Impeccable polish로 과제 화면 정리`.
`audit`: 접근성·성능·반응형. `critique`: 사용성·디자인. `polish`: 최종 정돈.
`harden`: 오류·경계 조건. `adapt`: 화면 크기 대응. 상세 기준은 해당 `reference/` 문서.

문맥 로더가 필요할 때 루트에서 실행:

```sh
sh .agents/skills/impeccable/scripts/impeccable context
```

Windows 명령 프롬프트:

```bat
.agents\skills\impeccable\scripts\impeccable.cmd context
```

로더는 플랫폼 바이너리 사용. 첫 실행 시 외부 다운로드 가능. 앱 `npm ci`와 별개.
실행 실패 시 `PRODUCT.md`, `DESIGN.md`, 화면 문서 직접 확인. 없는 결과를 검증 완료로 표시 금지.
스킬 업데이트 후 로컬 안내와 원본 버전 확인. 프로젝트 요구·사용자 요청 우선.
