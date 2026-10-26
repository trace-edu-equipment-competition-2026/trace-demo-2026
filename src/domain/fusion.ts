import { demoSources } from './demoSources'
import { initialAssignment, type Assignment } from './assignment'
import { defaultCourse, type Course } from './course'
import { teachingTeams, type Evidence, type GuidanceEvent } from './evidence'
import type { SupportProposal, Situation } from './learningLoop'
import { studentInitial, type StudentState } from './student'

export const fusionStorage = 'trace-fusion-workspace-v1'

export const fusionRubric = [
  { name: '문제 정의', weight: 20 },
  { name: '지식 연결·전이', weight: 25 },
  { name: '설계·구현 과정', weight: 25 },
  { name: '검증·성찰', weight: 20 },
  { name: '협업', weight: 10 },
]

export const fusionConnections = [
  {
    name: '데이터베이스',
    source: '이전 학기',
    known: '테이블과 기본 SQL',
    need: '문서·출처·수정일을 연결하는 데이터 구조',
    action: '안내문 5개의 출처를 작은 테이블로 모델링',
    status: '적용 중',
  },
  {
    name: '웹 프로그래밍',
    source: '이번 학기',
    known: '폼 입력과 화면 구성',
    need: '요청·응답과 오류 상태 처리',
    action: 'API 없이 고정 JSON으로 답변·빈 결과 화면 만들기',
    status: '작은 실험',
  },
  {
    name: 'UX · 의사소통',
    source: '다른 교과',
    known: '사용자 인터뷰와 질문 구체화',
    need: '학생의 실제 질문과 성공 기준 정의',
    action: '재학생 3명의 질문을 분류하고 평가 문항으로 전환',
    status: '근거 확보',
  },
  {
    name: 'AI · 정보 탐색',
    source: '새로 탐색',
    known: '프롬프트로 질문하기',
    need: '검색 근거와 생성 답변을 구분하는 방법',
    action: '자료에 없는 질문에서 답변을 보류하는 실험',
    status: '지도 필요',
  },
  {
    name: '정보 윤리',
    source: '다른 교과',
    known: '개인정보 최소 수집',
    need: '질문 로그에 식별 정보가 남지 않는 설계',
    action: '학번이 포함된 입력의 마스킹 기준 작성',
    status: '확인 필요',
  },
]

export type FusionEvidence = {
  resourceId?: string
  id?: string
  raw?: string
  goal?: string
  stage?: number
  kind?: 'record' | 'plan' | 'reflection'
  cycle?: number
  supportId?: string
  resultId?: string
  title: string
  detail: string
  owner: string
  source: string
  criterion: string
  time: string
}

export type FusionData = {
  assignment?: Assignment
  supports?: SupportProposal[]
  situation?: Situation
  alternative?: { evidenceId: string; status: 'pending' | 'accepted' | 'needs-evidence' }
  alternativeDraft?: { method: string; raw: string; explanation: string }
  chatRecords?: {
    taskId: string
    drafts: Record<string, { values: string[]; decision?: string; resultId?: string; evidenceId?: string }>
  }
  guidanceDemo?: {
    scene: number
    taskId: string
    drafts: Record<string, { values: string[]; evidenceId?: string }>
  }
  simulation?: {
    extensionFixed?: boolean
    target: string
    rules: boolean[]
    checks: Record<string, boolean>
    lines: string[]
    note: string
  }
  brief: string
  rubric: typeof fusionRubric
  plan: {
    name: string
    problem: string
    audience: string
    scope: string
    language: string
    frontend: string
    backend: string
    tools: string
    reason: string
  }
  connections: typeof fusionConnections
  completed: string[]
  experiment: boolean
  experimentNote: string
  evidence: FusionEvidence[]
  student: StudentState
  guidance: { text?: string; id?: string; level: number; topic: string; time: string }[]
  request: string
  teacherFeedback: string
  feedbackSent: boolean
  decisions: Record<string, string>
  reviews: Record<string, { judgments: Record<string, string>; feedback: string }>
}

export const fusionTasks = [
  {
    id: 'problem',
    title: '실제 사용자 문제를 한 문장으로 정의',
    owner: '김민준',
    stage: '완료',
    detail: '재학생이 어떤 안내를 찾다가 막히는지 인터뷰로 확인',
  },
  {
    id: 'schema',
    title: '안내문과 출처 데이터 구조 설계',
    owner: '유송민',
    stage: '완료',
    detail: '문서 ID와 출처를 연결하는 데이터 구조 작성',
  },
  {
    id: 'contract',
    title: '고정 JSON으로 화면·API 계약 확인',
    owner: '유송민',
    stage: '진행 중',
    detail: '백엔드 구축 전에 요청·응답 형식을 합의',
  },
  {
    id: 'empty',
    title: '근거가 없을 때의 화면 만들기',
    owner: '장시우',
    stage: '진행 중',
    detail: '추측 답변 대신 자료 없음과 다음 확인 방법 표시',
  },
  {
    id: 'test',
    title: '일치·미등록·개인정보 질문 검증',
    owner: '윤서준',
    stage: '할 일',
    detail: '성공 사례뿐 아니라 실패와 경계 조건도 기록',
  },
  {
    id: 'reflect',
    title: '새로 배운 개념과 적용 근거 공유',
    owner: '유송민',
    stage: '할 일',
    detail: '힌트를 어떤 판단과 실제 행동으로 옮겼는지 설명',
  },
]

const student: StudentState = {
  ...structuredClone(studentInitial),
  privateMessages: [
    {
      author: '유송민',
      text: 'Python은 배웠는데 React 화면과 어떻게 연결할지 모르겠어요.',
      time: '14:02',
    },
    {
      author: 'AI',
      text: '지금은 도구를 더 고르기보다 입력과 출력부터 합의해 볼까요? 사용자가 보내는 질문과 화면에 필요한 답변·출처를 JSON 예시로 작성하고, 실제 서버 없이 화면에 연결해 보세요.',
      time: '14:02',
      level: 2,
    },
  ],
  teamMessages: [
    {
      author: '김민준',
      text: '인터뷰에서는 식당 메뉴보다 장학·시설 안내를 찾는 과정이 더 불편하다고 했어. 우선 공개 안내문 5개로 범위를 좁히자.',
      time: '13:50',
    },
    {
      author: '장시우',
      text: '답변 아래 출처와 수정일을 보여주는 화면을 만들고 있어. 자료가 없을 때 상태도 필요해.',
      time: '14:04',
    },
    {
      author: '유송민',
      text: '문서 ID와 출처가 함께 조회되도록 자료 구조를 잡아볼게. API는 고정 응답으로 먼저 맞춰보자.',
      time: '14:05',
    },
    {
      author: '윤서준',
      text: '고정 응답으로 확인했어. 도서관 질문은 D01 링크가 보이지만 자료에 없는 질문에도 답이 나와. T02 실패 기록을 올렸어.',
      resourceIndex: 7,
      time: '14:10',
    },
    {
      author: '장시우',
      text: 'API에서 막을지 화면에서 막을지 상의하자. 현재 응답계약 초안을 같이 보면서 어떤 조건을 검사할지 정하면 좋겠어.',
      resourceIndex: 5,
      time: '14:11',
    },
  ],
  resources: [
    {
      name: '사용자 인터뷰 요약',
      kind: '팀 문서',
      body: '재학생 3명 대상 가상 인터뷰\n관찰: 검색어를 바꿔도 안내 위치를 찾기 어려움\n요구: 답과 함께 원문 안내로 돌아갈 수 있어야 함\n다음: 공개 안내문 5개로 먼저 검증',
      author: '김민준',
      version: 2,
    },
    {
      name: '자료 구조 설계',
      kind: '팀 문서',
      body: '문서와 답변의 자료 구조\ndocument: id, title, body, source, updated_at\nanswer: text, source_ids, status\n출처가 없는 응답은 not_found로 구분한다.',
      author: '유송민',
      version: 1,
    },
    {
      name: '검증 문항과 성공 기준',
      kind: '검증 기록',
      body: '1. 등록된 안내 질문 → 출처와 답변을 함께 표시\n2. 자료에 없는 질문 → 답변을 보류\n3. 학번이 포함된 질문 → 식별 정보 없이 기록\n4. 서버 오류 → 재시도 안내\n예시 결과는 실제 사용자 검증과 구분한다.',
      author: '윤서준',
      version: 1,
    },
  ],
  checks: [],
}

student.resources.push(...structuredClone(demoSources.fusion))
student.resourceSchema = 3

export const initialFusion: FusionData = {
  brief:
    'AI를 활용해 실제 사용자의 문제를 해결하는 프로그램을 기획하고 제작하세요. 주제·언어·프레임워크·도구는 팀이 선택합니다. 필요한 개념과 도구를 탐색하고, 선택 이유와 실제 검증 결과를 근거로 남기세요.',
  rubric: fusionRubric,
  plan: {
    name: '캠퍼스 길잡이',
    problem: '학교 안내가 흩어져 필요한 정보를 찾기 어렵다.',
    audience: '학교생활 정보를 찾는 재학생',
    scope: '공개 안내문 5개에 대해 출처를 보여주는 질의응답 프로토타입',
    language: 'TypeScript + Python',
    frontend: 'React',
    backend: 'FastAPI',
    tools: 'Figma · Git · SQLite',
    reason:
      'Python으로 API를 만들고, React로 입력과 결과 화면을 구성한다. 먼저 고정 JSON으로 화면을 검증한 뒤 검색과 생성을 단계적으로 연결한다.',
  },
  connections: fusionConnections,
  completed: ['problem', 'schema'],
  experiment: false,
  experimentNote: '',
  evidence: [
    {
      resourceId: 'interview-source',
      stage: 0,
      kind: 'record',
      raw: demoSources.fusion.find(r => r.id === 'interview-source')!.body,
      title: '정보 탐색 문제의 범위 정의',
      detail:
        '인터뷰 요약에서 안내 검색 실패와 단순한 답변 생성 요구를 구분했습니다. 안내 원문으로 돌아갈 수 있어야 한다는 사용자 조건을 팀과 합의했습니다.',
      owner: '유송민',
      source: '사용자 인터뷰 → 데이터 요구 정의',
      criterion: '문제 정의',
      time: '13:57',
    },
    {
      resourceId: 'api-contract',
      stage: 2,
      kind: 'plan',
      raw: demoSources.fusion.find(r => r.id === 'api-contract')!.body,
      title: '요청·응답 계약 초안',
      detail:
        '요청·응답을 answer, source_ids, status 필드로 표현했습니다. 정상 예시는 합의했으며 자료 없음과 오류 조건은 추가 확인이 필요합니다.',
      owner: '유송민',
      source: '요청·응답 설계 기록',
      criterion: '설계·구현 과정',
      time: '14:06',
    },
    {
      stage: 2,
      kind: 'plan',
      raw: '[시연용 팀 채팅 발췌 · 14:07]\n장시우: source_ids가 비었는데 answer가 있으면 정상 화면으로 표시돼.\n유송민: 자료 없음 상태를 별도로 두자는 안에 동의해. API와 화면 중 어디서 판별할지는 비교하자.\n합의 전: 오류 상태의 처리 주체와 테스트 조건은 아직 미정.',
      title: '프런트엔드와 필드 합의',
      detail:
        '장시우의 화면 요구와 데이터 구조를 비교해 출처·수정일 필드를 공유했습니다. 아직 응답 오류 상태의 표현은 합의되지 않았습니다.',
      owner: '유송민',
      source: '팀 대화 · 공동 설계',
      criterion: '협업',
      time: '14:07',
    },
    {
      resourceId: 'schema-source',
      stage: 1,
      kind: 'record',
      raw: demoSources.fusion.find(r => r.id === 'schema-source')!.body,
      title: '자료 구조 설계',
      detail: '테이블·키를 문서 ID와 출처 연결에 적용했습니다.',
      owner: '유송민',
      source: '자료 구조 설계 기록',
      criterion: '지식 연결·전이',
      time: '14:01',
    },
    {
      resourceId: 'interview-source',
      stage: 0,
      kind: 'record',
      raw: demoSources.fusion.find(r => r.id === 'interview-source')!.body,
      title: '인터뷰로 범위 좁히기',
      detail: '요구를 비교해 공개 안내문 5개로 1차 범위를 정했습니다.',
      owner: '김민준',
      source: '사용자 인터뷰 기록',
      criterion: '문제 정의',
      time: '13:55',
    },
  ],
  student,
  guidance: [{ level: 2, topic: '요청·응답 계약을 작은 실험으로 나누기', time: '14:02' }],
  request: '자료가 없는 질문을 처리하는 방법과 검증 기준을 함께 점검받고 싶습니다.',
  teacherFeedback: '',
  feedbackSent: false,
  decisions: {},
  reviews: {},
}

export function fusionReply(question: string) {
  if (/개인정보|학번|보안/.test(question)) {
    return {
      level: 3,
      topic: '질문 로그의 개인정보 최소화',
      text: '답변에 꼭 필요한 정보만 남기는 방법을 생각해 볼까요? 질문에 학번이 있어야 답할 수 있는지 먼저 구분하세요. 없어도 된다면 저장 전에 지우는 규칙을 정하고, 가짜 학번을 넣은 입력으로 무엇이 남는지 확인해 보세요.',
    }
  }
  if (/언어|프레임워크|React|Python|도구|기술/i.test(question)) {
    return {
      level: 2,
      topic: '배운 기술과 새로 필요한 기능 비교',
      text: '만들 기능, 이미 할 수 있는 것, 새로 필요한 것을 세 칸으로 나눠 보세요. 화면·데이터·AI 처리 중 어느 부분이 가장 불확실한가요? 두 기술 후보를 학습 부담과 검증 가능한 최소 기능으로 비교하고 선택 이유를 팀 기획에 남겨보세요.',
    }
  }
  if (/출처|없는|환각|근거|검색/.test(question)) {
    return {
      level: 3,
      topic: '검색 자료와 답변 근거 검증',
      text: '답변 생성과 자료 검색을 분리해서 생각해 볼까요? 먼저 “질문에 해당하는 자료가 있는가”를 확인하고, 없으면 생성을 멈추는 규칙을 만들어 보세요. 등록된 질문과 미등록 질문을 같은 조건에서 비교하면 어떤 결과가 나와야 하나요?',
    }
  }
  if (/API|연결|JSON|서버|실행/i.test(question)) {
    return {
      level: 4,
      topic: '요청·응답을 나누어 확인하기',
      text: '실제 서버를 붙이기 전에 { answer, source_ids, status } 형태의 고정 JSON을 화면에 넣어보세요. 정상·자료 없음·오류 응답을 각각 만들어 표시가 달라지는지 확인하세요. 그 다음 같은 형식을 반환하는 작은 API 하나를 연결하면, 화면과 서버 중 어디에서 막혔는지 나눠 볼 수 있습니다.',
    }
  }
  return {
    level: 1,
    topic: '문제와 다음 확인 행동 구체화',
    text: '누가 어떤 상황에서 겪는 문제인가요? 지금 알고 있는 사실과 아직 확인하지 못한 가정을 나눠 적어보세요. 이 가정을 확인할 가장 작은 실험은 무엇일까요? 결과가 예상과 다르면 무엇을 다시 확인해야 할까요?',
  }
}

export const fusionAssignment: Assignment = {
  ...structuredClone(initialAssignment),
  title: 'AI를 활용한 프로그램 기획·제작',
  description: initialFusion.brief,
  goals: [
    '실제 사용자 문제를 정의하고 필요한 지식을 연결한다.',
    '도구 선택의 근거를 설명하고 작은 실험으로 가설을 검증한다.',
    '필요한 개념과 도구를 적용하고 선택·검증 근거를 남긴다.',
  ],
  requirements: [
    '사용자의 문제와 최소 제작 범위를 구체적으로 정의한다.',
    '언어·프레임워크·도구 후보를 비교하고 선택 이유를 설명한다.',
    '교과 지식을 적용하고 정상·실패 조건의 검증 결과를 남긴다.',
  ],
  outputs: [
    { name: '문제 정의와 기술 선택서', format: 'PDF', required: '필수' },
    { name: '프로토타입 및 검증 기록', format: '코드', required: '필수' },
  ],
  environment: { kind: 'workspace', template: '근거 기반 응답 검증', url: '', instructions: '' },
  criteria: [
    { name: '문제 이해', weight: 20 },
    { name: '지식 연결·해결 과정', weight: 30 },
    { name: '검증', weight: 20 },
    { name: '산출물', weight: 20 },
    { name: '협업', weight: 10 },
  ],
  situation: '자료에 없는 질문에도 프로그램이 답변을 생성합니다.',
  manualGuidance: '자료가 있는 질문과 없는 질문의 처리 결과를 비교하고, 답변을 보류해야 하는 조건을 설명해 보세요.',
}

export const fusionCourse: Course = {
  ...structuredClone(defaultCourse),
  name: '융합 팀 프로젝트',
  students: '융합 프로젝트 A반 · 24명',
  description: initialFusion.brief,
  goals: fusionAssignment.goals,
  standards: [
    '사용자 요구와 최소 제작 범위를 근거로 정의한다.',
    '문제에 필요한 개념을 탐색하고 설계에 적용한다.',
    '정상·실패·경계 조건을 비교하여 검증한다.',
  ],
  ncs: ['응용 소프트웨어 개발 · 시연용 능력단위', '정보서비스 기획 · 시연용 능력단위'],
  criteria: fusionAssignment.criteria,
  curriculum: [
    '문제 탐색',
    '사용자 인터뷰',
    '선행 지식 점검',
    '아이디어 비교',
    '기술·도구 선택',
    '데이터 설계',
    '작은 프로토타입',
    '중간 프로젝트 점검',
    'API·화면 통합',
    '경계 조건 처리',
    '사용자 검증',
    '정보 윤리',
    '교과 지식 전이',
    '팀 프로젝트 개선',
    '산출물 검토',
    '최종 발표와 성찰',
  ],
  documents: [
    { name: '융합프로젝트 수업계획서.pdf', type: '수업계획', area: '목표 · 일정', updated: '2026-09-01' },
    { name: '융합프로젝트 평가계획.pdf', type: '평가', area: '평가 기준', updated: '2026-09-01' },
  ],
}

const fusionTeamNames = [
  '캠퍼스 길잡이',
  '공유물품 연결소',
  '학습 회고 노트',
  '급식 수요 예측',
  '접근성 안내 도우미',
  '에너지 사용 리포트',
]

const fusionTeamKnowledge = [
  '데이터베이스 · 웹 · 정보 윤리',
  '수학 · 데이터베이스 · 사용자 조사',
  '교육학 · 통계 · 웹',
  '확률과 통계 · 데이터 분석',
  'UX · 접근성 · 프로그래밍',
  '물리 · 통계 · 시각화',
]

export const fusionTeams = teachingTeams.map((t, i) => ({
  ...t,
  name: fusionTeamNames[i],
  knowledge: fusionTeamKnowledge[i],
  tools: [
    'TypeScript · React · Python · FastAPI',
    'Python · Streamlit · SQLite',
    'TypeScript · React · Node.js',
    'Python · 데이터 분석 도구',
    '웹 · 음성 안내 · UX 도구',
    'Python · 시각화 도구',
  ][i],
  summary: [
    '출처와 답변의 연결을 확인했습니다. 자료 없는 질문과 식별 정보 처리 범위를 더 확인합니다.',
    '기술 후보를 비교했지만 기준 모델의 실행 결과가 없습니다. 최적화 전에 수량 조건 하나로 시험할 수 있는지 확인합니다.',
    '기본 회고 질문을 구현했습니다. 새로운 입력 조건을 추가하는 상황 제안이 승인 대기입니다.',
    '데이터 표본 비교 후 수행이 멈췄습니다. 배운 통계 개념을 예측 조건으로 옮기는 데 어려움이 있는지 확인합니다.',
    '사용자 조건별 동작 결과를 비교했습니다. 접근성 확인 범위를 자기 설명으로 정리합니다.',
    '소비 데이터 정규화 규칙을 바꾸고 검증 계획을 공유했습니다. 후속 비교 결과를 기다립니다.',
  ][i],
  reasons: [
    i === 1 ? '18분간 후속 수행 기록 없음' : i === 3 ? '32분간 새 수행 기록 없음' : '설계·수행 근거 비교 필요',
    i === 1 || i === 3 ? '작은 실험과 검증 결과 미수집' : '기존 지식의 적용 범위와 한계 확인',
  ],
}))

// 융합 시나리오용 팀별 과정증거 및 가이던스 변환.
export function applyFusionScenarioEvidence(
  teams: typeof fusionTeams,
  name: string,
  team: number,
  data: { incomplete: boolean; evidence: Evidence[]; guidance: GuidanceEvent[] },
) {
  const topic = teams[team - 1].name
  const korean = [
    '사용자 문제와 범위 가설',
    '요구 조건과 자료 비교',
    '최소 구현과 선택 근거',
    '경계 조건의 결과 검증',
    '다음 검증 계획과 팀 공유',
  ]
  const sample = [
    {
      problem: '최신 장학 공지와 과거 공지를 구분하기 어려움',
      input: '도서관 운영 시간',
      expected: 'D01 원문과 답변',
      missing: '등록하지 않은 기숙사 안내',
      boundary: '학번 DEMO-001 포함 질문',
      decision: '출처 없는 답변은 보류',
      next: '자료 갱신 뒤 원문 연결 재확인',
    },
    {
      problem: '대여 가능한 물품과 수량을 알 수 없음',
      input: '멀티탭 1개 대여',
      expected: '수량 3→2와 대여 기록',
      missing: '존재하지 않는 물품 ID',
      boundary: '수량 -1',
      decision: '재고 확인 후 대여 기록 저장',
      next: '동시 대여 시 재고 음수 방지 확인',
    },
    {
      problem: '학습 회고를 작성해도 다음 행동을 정하기 어려움',
      input: '반환 경로를 놓쳐 통신 검증에 실패했다',
      expected: '관찰·원인 가설·다음 행동 항목 표시',
      missing: '빈 회고',
      boundary: '학번 DEMO-001 포함 회고',
      decision: '식별 정보 제외와 빈 회고 입력 안내',
      next: '오류 입력 처리 규정과 재시도 확인',
    },
    {
      problem: '급식 예상 수요와 실제 이용 인원이 달라 잔반 발생',
      input: '과거 이용 인원 40,44,42',
      expected: '기준 예측 42명',
      missing: '관찰값 없음',
      boundary: '이용 인원 -3',
      decision: '평균 기준 모델과 비교',
      next: '요일별 예측 오차 대조',
    },
    {
      problem: '화면만으로 강의실 위치를 찾기 어려움',
      input: '본관 201호 경로 안내',
      expected: '텍스트 경로와 음성 안내',
      missing: '등록하지 않은 강의실',
      boundary: '음성 장치 없음',
      decision: '텍스트 대체 경로 유지',
      next: '키보드 이동과 화면 낭독 순서 확인',
    },
    {
      problem: '단위가 다른 소비 기록을 직접 비교하기 어려움',
      input: '1kWh와 1000Wh',
      expected: '둘 다 1kWh로 정규화',
      missing: '측정값 없음',
      boundary: '소비량 -2kWh',
      decision: '단위 변환 후 비교',
      next: '측정 누락과 집계 기간 차이 확인',
    },
  ][team - 1]

  const raw = [
    `[시연용 원문 · ${topic}/interview.csv · 14:05]\nid,질문,답변\nU01,어떤 작업이 어려웠나요?,"${sample.problem}"\nU02,오류가 났을 때 무엇이 필요했나요?,"결과와 그 근거를 확인하고 싶어요"\n작성자: ${name} / 실제 사용자 인터뷰 아님`,
    `[시연용 조사 노트 · ${topic}/research.txt · 14:09]\n조사 주제: ${teams[team - 1].knowledge}\n참조: 수업 제공 설계 예제 (가상 자료)\n예제 발췌: 입력 → 유효성 확인 → 처리 → 결과 표시\n비교표\n안 A | 정상 입력만 구현 | 빠른 제작 | 실패 안내 미확인\n안 B | 입력과 오류 상태 분리 | 비교 가능 | 추가 분기 필요\n팀 선택: B / 미확인: 실제 사용자 조건`,
    `[시연용 팀 설계 파일 · ${topic}/input-contract.json · 14:11]\n도구: ${teams[team - 1].tools}\n${JSON.stringify(
      {
        valid: { input: sample.input, expected: sample.expected },
        missing: { input: sample.missing, expected: '추측 없이 미확인 상태 안내' },
        boundary: { input: sample.boundary, expected: '조건에 맞는 예외 처리' },
      },
      null,
      2,
    )}\n변경 전: 정상 조건만 고려 / 변경 후: 실패·경계 입력 분리`,
    `[시연용 중간 실행 원문 · ${topic}/test-results.csv · 14:12]\ncase,expected,observed,result\nnormal,${sample.expected},${sample.expected},PASS\nmissing,미확인 안내,미확인 안내,PASS\nboundary,예외 처리,처리 기록 있음,PASS\n환경: 고정 입력 / v0.2 / 실제 서비스 아님`,
    `[시연용 학생 작성 회고 · ${topic}/reflection.txt · 14:14]\n선택: ${sample.decision}\n이유: 조사 예제와 입력 조건별 실행을 비교했기 때문\n남은 조건: ${sample.next}\n다음 행동: 담당자와 확인 방법을 합의하고 결과를 기록`,
  ]

  data.evidence = data.evidence.map(e => ({
    ...e,
    title: e.id === 'E05' && !data.incomplete ? '해결 과정 자기 설명' : korean[Number(e.id.slice(1)) - 1],
    source: e.shared ? '팀 공유 · 설계 자료' : '학생 수행 · 프로젝트 기록',
    goal: '기존 지식을 새로운 문제에 적용하고 근거로 설명하기',
    raw: raw[Number(e.id.slice(1)) - 1],
    explanation: '배운 개념과 이번 프로그램의 요구를 비교했습니다. 아직 확인하지 못한 조건은 다음 실험으로 남겼습니다.',
    interpretation: '선택한 개념과 실제 수행을 연결한 기록이 있습니다. 다른 조건에 대한 이해는 추가 질문으로 확인합니다.',
    limitation: e.shared
      ? '팀 자료를 해석한 기록입니다. 직접 수행 여부는 학생 설명과 함께 확인하세요.'
      : '기록된 예시 조건만으로 전체 프로그램의 품질을 확정하지 않습니다.',
  }))

  data.guidance = data.guidance.map((g, i) => ({
    ...g,
    reason: [
      '문제 범위를 정하기 어려움',
      '배운 기술과 새 조건을 연결하지 못함',
      '구현과 검증을 혼동할 가능성',
      '작은 실험 방법의 구체화 필요',
      '학생이 다음 확인을 직접 선택함',
    ][i],
    support: [
      '관찰한 사용자 요구를 구분하는 확인 질문',
      '기존 지식과 필요한 기능을 비교하도록 탐색 안내',
      '검색과 생성·검증의 역할을 구분하는 개념 힌트',
      '고정 응답과 경계 입력을 비교하는 도구 힌트',
      '선택 이유와 다음 확인을 스스로 설명하도록 질문',
    ][i],
    response: i === data.guidance.length - 1 ? '선택 근거와 다음 수행을 설명함' : '지원 내용을 실제 요구와 비교하고 계획에 반영함',
  }))
}
