import { demoSources } from './demoSources'
import { initialAssignment } from './assignment'
import { defaultCourse } from './course'
import { teachingTeams, studentEvidence, buildLiveStudentEvidence } from './evidence'
import {
  initialFusion,
  fusionReply,
  fusionTasks,
  fusionAssignment,
  fusionCourse,
  fusionTeams,
  applyFusionScenarioEvidence,
  type FusionData,
} from './fusion'
import { studentInitial, guidanceReply, selectGuidanceLevel } from './student'

export type WorkspaceId = 'network' | 'fusion'
export type ProjectData = FusionData

export const workspaceKey = (id: WorkspaceId, key: string) => (id === 'network' ? key : `fusion-${key}`)

const networkConnections = [
  {
    name: '네트워크 기초',
    source: '이전 학기',
    known: 'IP 주소와 서브넷',
    need: '장애 범위를 주소와 경로로 구분',
    action: '본사·지사·라우터 연결 대역을 표로 비교',
    status: '적용 중',
  },
  {
    name: '라우팅 실습',
    source: '이번 학기',
    known: '정적 경로의 목적지와 다음 홉',
    need: '요청 경로와 반환 경로를 함께 진단',
    action: '두 라우터의 경로와 인터페이스 비교',
    status: '작은 실험',
  },
  {
    name: '문제해결 · 의사소통',
    source: '다른 교과',
    known: '관찰과 가설 구분',
    need: '원인 후보를 증거로 좁히기',
    action: '정상 구간·실패 구간을 팀에 설명',
    status: '근거 확보',
  },
  {
    name: '진단 도구',
    source: '새로 탐색',
    known: '기본 Ping 실행',
    need: '명령 결과를 경로·설정과 연결',
    action: '수정 전후와 양방향 결과를 비교',
    status: '지도 필요',
  },
  {
    name: '기술 문서 작성',
    source: '다른 교과',
    known: '결과와 근거 정리',
    need: '검증의 범위와 한계를 설명',
    action: '결과 파일과 학생 설명을 함께 기록',
    status: '확인 필요',
  },
]

const networkProject: ProjectData = {
  ...structuredClone(initialFusion),
  brief: initialAssignment.description,
  rubric: initialAssignment.criteria,
  plan: {
    name: '본사·지사 연결 복구',
    audience: '교내 실습실 사용자',
    problem: '본사 PC와 지사 PC 사이에 통신이 되지 않는다.',
    scope: 'R1·R2의 정적 경로 진단과 두 PC의 양방향 검증',
    language: '장비 CLI',
    frontend: '가상 네트워크 구성도',
    backend: '정적 라우팅',
    tools: 'Ping · 경로 조회 · 팀 문서',
    reason: '주소 대역과 경로를 함께 확인한다. 설정을 한 항목씩 비교하고 수정한 뒤 양방향 결과로 확인한다.',
  },
  connections: networkConnections,
  student: structuredClone(studentInitial),
  evidence: [
    {
      resourceId: 'route-capture',
      stage: 0,
      kind: 'plan',
      raw: demoSources.network.find(r => r.id === 'route-capture')!.body,
      title: '장애 구간의 첫 가설',
      detail: '게이트웨이까지 정상이고 지사 PC 응답은 없습니다. 전체 초기화 대신 두 라우터의 경로를 비교하겠습니다.',
      owner: '유송민',
      source: '관찰 → 원인 후보',
      criterion: '문제 이해',
      time: '14:03',
    },
    {
      resourceId: 'routing-research',
      stage: 1,
      kind: 'record',
      raw: demoSources.network.find(r => r.id === 'routing-research')!.body,
      title: '주소와 경로 비교',
      detail: '주소 대역을 기준으로 다음 홉과 실제 연결을 비교했습니다.',
      owner: '유송민',
      source: '주소·경로 비교 기록',
      criterion: '지식 연결·해결 과정',
      time: '14:08',
    },
  ],
  guidance: [{ level: 1, topic: '관찰한 구간과 다음 확인 지점 구분', time: '14:03' }],
  request: '반환 경로를 확인한 뒤 어떤 조건으로 검증해야 하는지 함께 점검받고 싶습니다.',
  completed: ['problem', 'schema'],
  experiment: false,
  experimentNote: '',
  teacherFeedback: '',
  feedbackSent: false,
  decisions: {},
  reviews: {},
}

const networkTaskDefinitions = [
  ['장애 현상과 영향 범위 정의', '어느 구간부터 실패하는지 관찰 결과를 정리'],
  ['주소와 경로 데이터 비교', 'IP·서브넷·정적 경로 지식을 적용'],
  ['수정할 다음 홉과 근거 합의', '원인 가설과 변경할 항목을 연결'],
  ['수정 전후 상태 기록', '팀원이 같은 조건으로 확인할 자료 작성'],
  ['양방향 통신 결과 검증', '본사→지사 및 지사→본사 결과를 비교'],
  ['적용한 개념과 판단 근거 공유', '판단·수정·검증에서 무엇을 배웠는지 설명'],
]

const networkTasks = fusionTasks.map((t, i) => ({
  ...t,
  title: networkTaskDefinitions[i][0],
  detail: networkTaskDefinitions[i][1],
}))

export const scenarios = {
  network: {
    id: 'network' as WorkspaceId,
    course: defaultCourse,
    assignment: initialAssignment,
    project: networkProject,
    tasks: networkTasks,
    roles: ['네트워크 설정·검증', '장애 원인 분석', '진단 도구 운영', '과정 기록·공유'],
    studentRole: '네트워크 설정·검증',
    projectNames: ['네트워크 장애 진단', 'VLAN 통신 검증'],
    secondaryTitle: 'VLAN 분리 및 부서 간 통신 검증',
    templates: ['정적 라우팅 장애 진단', 'VLAN 소속 오류 진단'],
    moduleEvidence: '명령 실행 · 설정 변경 · 통신 검증 결과',
    nodes: [
      ['PC-A', '192.168.10.10'],
      ['R1', '10.0.0.1'],
      ['R2', '10.0.0.2'],
      ['PC-B', '192.168.20.10'],
    ],
    needTitle: '설정 변경과 복구 확인을 어떻게 구분할까?',
    need: '주소와 경로는 알고 있지만, 반환 경로와 양방향 검증을 함께 확인해야 합니다.',
    previousGap: '지난 과제에서는 한 방향만 검증했어요. 이번에는 수정 전후·반대 방향·같은 조건을 함께 확인하세요.',
    approvalSituation:
      '기존 두 단말 복구에 더해 PC-C(192.168.30.10)의 통신을 확인하세요. 추가 대역 경로와 기존 단말의 양방향 결과를 비교하여 기록하세요.',
    approvalReason: '현재 결과는 기록된 두 단말에 한정됩니다.',
    guidance: '설정을 바꾸기 전과 후에 무엇이 달라졌나요? 원인 후보를 하나 정하고, 이를 확인할 검증 방법을 설명해 보세요.',
    prompts: [
      '통신이 안 되는데 정답과 설정 명령어 알려주세요.',
      'R1과 R2 중 어느 장비의 라우팅 테이블을 먼저 확인할까요?',
      '왜 양방향으로 검증해야 하나요?',
      '어떤 명령으로 경로를 확인하나요?',
    ],
    concepts: ['주소 대역과 통신 경로', '양방향 라우팅'],
    strength: ['관찰한 사실로 원인 범위를 좁힘', '정상 구간과 실패 구간을 나눠 보고, 실제 설정을 가설과 비교했습니다.'],
    gap: [
      '진단 계획만 있고 실제 수정 자료는 없습니다. 가설과 수정안의 연결을 확인해 주세요.',
      '검증 계획은 있지만 실행 결과가 없습니다. 양방향 통신 결과를 확인해 주세요.',
      '두 단말의 결과는 있습니다. 다른 대역에서도 성립하는지 자기 설명을 확인해 주세요.',
    ],
    teams: teachingTeams.map(t => ({
      ...t,
      name: `${t.id}팀 네트워크 복구`,
      knowledge: '주소 체계 · 라우팅 · 기술 문서',
      tools: '장비 CLI · Ping · 경로 조회',
    })),
    reply: (q: string, verified: boolean) => {
      const level = selectGuidanceLevel(q, verified)
      return {
        level,
        topic: ['관찰한 사실 정리', '요청·반환 경로 비교', '통신 성립 조건 설명', '진단 도구와 검증 방법'][level - 1],
        text: guidanceReply(level, verified),
      }
    },
  },
  fusion: {
    id: 'fusion' as WorkspaceId,
    course: fusionCourse,
    assignment: fusionAssignment,
    project: { ...structuredClone(initialFusion), rubric: fusionAssignment.criteria },
    tasks: fusionTasks,
    roles: ['API·데이터 연결', '사용자 문제 분석', '프로토타입 검증', '과정 기록·공유'],
    studentRole: 'API·데이터 연결',
    projectNames: ['AI 프로그램 기획·제작', '사용자 요구와 기술 비교'],
    secondaryTitle: '사용자 요구 분석과 기술 선택',
    templates: ['근거 기반 응답 검증', '사용자 입력 경계 조건 검증'],
    moduleEvidence: '요청 실행 · 응답 규칙 변경 · 경계 조건 검증',
    nodes: [
      ['질문 입력', '사용자 요구'],
      ['화면', 'React'],
      ['API', 'Python · FastAPI'],
      ['자료', '문서·출처 DB'],
    ],
    needTitle: '검색·생성·검증을 어떻게 나눌까?',
    need: 'Python 문법은 알고 있지만, 화면과 API 연결 및 근거 없는 응답 처리에는 새 학습이 필요합니다.',
    previousGap: '지난 웹 과제에서는 정상 화면만 확인했어요. 이번에는 자료 없음·오류·개인정보 조건을 명시하고 처리 이유를 설명하세요.',
    approvalSituation:
      '기본 회고 기능에 더해 빈 회고·식별 정보 입력의 처리 규정을 정리하고 예외 처리를 구현하세요. 정상 입력과 예외 입력의 결과를 비교해 기록하세요.',
    approvalReason: '정상 응답만으로 다른 입력 조건의 동작을 보장할 수 없습니다.',
    guidance: '현재 알고 있는 개념과 새로 필요한 개념을 나누고, 실제 API 없이 확인할 수 있는 가장 작은 실험을 설명해 보세요.',
    prompts: [
      '배운 Python과 새 프레임워크를 어떻게 고를까요?',
      '자료에 없는 질문은 어떻게 처리하나요?',
      '화면과 API를 어떻게 연결하나요?',
    ],
    concepts: ['사용자 요구와 자료 출처', '요청·응답과 데이터 구조'],
    strength: ['이전 교과의 개념을 새 설계에 연결함', '자료 구조와 사용자 요구를 비교하고, 새 프로그램에 필요한 조건을 설명했습니다.'],
    gap: [
      '기술 비교 계획만 있고 적용 자료는 없습니다. 작은 실험의 범위를 확인해 주세요.',
      '검증 계획은 있지만 실행 결과가 없습니다. 정상·미등록·개인정보 조건을 확인해 주세요.',
      '모의 조건의 결과는 있습니다. 실제 사용자와 API에서도 성립하는지 확인해 주세요.',
    ],
    teams: fusionTeams,
    reply: (q: string, _verified: boolean) => fusionReply(q),
  },
}

export type Scenario = typeof scenarios.network

function withDemoSources(data: ProjectData, base: ProjectData): ProjectData {
  if ((data.student.resourceSchema ?? 0) >= 3) return data
  const sourceKind = base.plan.language === '장비 CLI' ? 'network' : 'fusion'
  return {
    ...data,
    student: {
      ...data.student,
      resourceSchema: 3,
      resources: [
        ...data.student.resources,
        ...demoSources[sourceKind].filter(
          r => !data.student.resources.some(saved => saved.id === r.id || saved.name === r.name),
        ),
      ],
    },
    evidence: data.evidence.map(e => {
      const authored = base.evidence.find(b => b.title === e.title && b.detail === e.detail)
      return !e.id && !e.raw && authored
        ? { ...e, raw: authored.raw, resourceId: authored.resourceId, stage: authored.stage, kind: authored.kind }
        : e
    }),
  }
}

export function readProject(id: WorkspaceId): ProjectData {
  const base = structuredClone(scenarios[id].project)
  try {
    const current = JSON.parse(localStorage.getItem(`trace-project-${id}-v2`) || 'null')
    if (current?.plan && current.student && Array.isArray(current.evidence)) {
      return withDemoSources({ ...base, ...current }, base)
    }
    const legacyKey = id === 'network' ? 'trace-student-yusongmin-v1' : 'trace-fusion-workspace-v1'
    const legacy = JSON.parse(localStorage.getItem(legacyKey) || 'null')
    if (legacy) {
      return withDemoSources(
        id === 'network' ? { ...base, student: { ...base.student, ...legacy } } : { ...base, ...legacy },
        base,
      )
    }
  } catch {
    /* 로컬 시나리오 기본값 사용. */
  }
  return base
}

export function scenarioEvidence(
  s: Scenario,
  name: string,
  role: string,
  team: number,
  alternate: boolean,
  project?: ProjectData,
) {
  const data = studentEvidence(name, role, team, alternate)
  if (s.id === 'fusion') {
    applyFusionScenarioEvidence(s.teams, name, team, data)
  }
  if (name === '유송민' && project) {
    return buildLiveStudentEvidence(s.assignment, name, data, project)
  }
  return data
}
