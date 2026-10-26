import type { StudentState } from './student'

// 네트워크 실습 토폴로지 명세.
export const networkTopologySpecs = [
  { id: 'PC-A', role: '본사 단말', ip: '192.168.10.10/24', detail: 'GW 192.168.10.1' },
  { id: 'R1', role: '본사 라우터', ip: 'LAN 192.168.10.1/24', detail: 'WAN 10.0.0.1/30' },
  { id: 'R2', role: '지사 라우터', ip: 'WAN 10.0.0.2/30', detail: 'LAN 192.168.20.1/24' },
  { id: 'PC-B', role: '지사 단말', ip: '192.168.20.10/24', detail: 'GW 192.168.20.1' },
] as const

export type SimulationConfig = {
  labels: string[]
  conditions: string[]
  commands: string[]
  placeholder: string
  title: string
}

// 시나리오 및 심화 상태별 모의 실행 구성 반환.
export function getSimulationConfig(isNetwork: boolean, extended: boolean): SimulationConfig {
  if (isNetwork) {
    return {
      labels: ['수정 전 실패 결과를 비교 기준으로 사용', '반대 방향의 결과까지 확인'],
      conditions: ['경로 수정', '본사 → 지사', '지사 → 본사', ...(extended ? ['추가 단말 PC-C'] : [])],
      commands: [
        'ping 192.168.10.1',
        'ping 192.168.20.10',
        'traceroute 192.168.20.10',
        'show ip route',
        'show ip interface brief',
        'show running-config',
        'ping 192.168.10.10',
        ...(extended ? ['ping 192.168.30.10'] : []),
      ],
      placeholder: '예: show ip route',
      title: extended ? '추가 대역의 복구 재검증' : '양방향 복구 검증',
    }
  }
  return {
    labels: [
      '근거 자료가 없으면 답변 보류',
      '질문 로그에서 학번 가리기',
      ...(extended ? ['외부 API 대신 공개 자료 조회로 처리'] : []),
    ],
    conditions: ['등록된 질문', '자료에 없는 질문', '개인정보 포함 질문', ...(extended ? ['외부 API 중단'] : [])],
    commands: [
      'GET /schema',
      'TEST registered',
      'TEST unknown',
      'TEST privacy',
      'GET /status',
      ...(extended ? ['TEST offline'] : []),
    ],
    placeholder: '예: TEST unknown',
    title: extended ? '자원 변경 후 대안 처리 재검증' : '근거와 개인정보 경계 조건 검증',
  }
}

export type CommandContext = {
  isNetwork: boolean
  extended: boolean
  target: string
  rules: boolean[]
  checks: Record<string, boolean>
  student: StudentState
  extensionFixed: boolean
  conditions: string[]
}

export type CommandResult = {
  input: string
  output: string
  checks: Record<string, boolean>
  student: StudentState
  extensionFixed: boolean
  resetProgress: boolean
}

// 모의 콘솔 명령 처리 및 상태 전이 계산.
export function executeSimulationCommand(rawInput: string, ctx: CommandContext): CommandResult | null {
  const input = rawInput.trim().replace(/\s+/g, ' ')
  if (!input) return null

  let output = '지원하는 조회·시험 요청을 확인하거나, 다른 해결 방법의 수행자료를 제출해 주세요.'
  let nextChecks = { ...ctx.checks }
  let student = { ...ctx.student }
  let extraFixed = ctx.extensionFixed

  if (ctx.isNetwork) {
    if (input === 'show ip route') {
      output =
        ctx.target === 'R1'
          ? `S 192.168.20.0/24 via 10.0.0.2${ctx.extended ? `\n192.168.30.0/24: ${extraFixed ? 'via 10.0.0.2' : '경로 없음 · PC-C는 R2 뒤 추가 대역'}` : ''}`
          : ctx.target === 'R2'
            ? `S 192.168.10.0/24 via ${student.routeFixed ? '10.0.0.1' : '10.0.0.9'}${ctx.extended ? '\nC 192.168.30.0/24 directly connected' : ''}`
            : '라우터를 선택해 경로를 확인하세요.'
    } else if (input === 'show ip interface brief') {
      output = 'R1: 10.0.0.1 up/up\nR2: 10.0.0.2 up/up'
    } else if (input === 'show running-config' || input === 'show running-config | include ip route') {
      output =
        ctx.target === 'R1'
          ? `interface GigabitEthernet0/0\n ip address 192.168.10.1 255.255.255.0\ninterface GigabitEthernet0/1\n ip address 10.0.0.1 255.255.255.252\nip route 192.168.20.0 255.255.255.0 10.0.0.2${ctx.extended && extraFixed ? '\nip route 192.168.30.0 255.255.255.0 10.0.0.2' : ''}`
          : ctx.target === 'R2'
            ? `interface GigabitEthernet0/0\n ip address 192.168.20.1 255.255.255.0\ninterface GigabitEthernet0/1\n ip address 10.0.0.2 255.255.255.252\nip route 192.168.10.0 255.255.255.0 ${student.routeFixed ? '10.0.0.1' : '10.0.0.9'}`
            : '라우터를 선택해 설정을 확인하세요.'
    } else if (input.startsWith('traceroute ') || input.startsWith('tracert ')) {
      const dest = input.split(' ')[1]
      if (ctx.target === 'PC-A' && dest === '192.168.20.10') {
        output = student.routeFixed
          ? '1 192.168.10.1 (R1) 1ms\n2 10.0.0.2 (R2) 2ms\n3 192.168.20.10 (PC-B) 3ms'
          : '1 192.168.10.1 (R1) 1ms\n2 * * * Request timed out.'
      } else if (ctx.target === 'PC-B' && dest === '192.168.10.10') {
        output = student.routeFixed
          ? '1 192.168.20.1 (R2) 1ms\n2 10.0.0.1 (R1) 2ms\n3 192.168.10.10 (PC-A) 3ms'
          : '1 192.168.20.1 (R2) 1ms\n2 * * * Request timed out.'
      } else {
        output = 'PC-A에서 192.168.20.10 또는 PC-B에서 192.168.10.10 경로를 추적하세요.'
      }
    } else if (input.startsWith('ip route ')) {
      if (ctx.target === 'R2' && input === 'ip route 192.168.10.0 255.255.255.0 10.0.0.1') {
        student = { ...student, routeFixed: true, forward: false, reverse: false }
        nextChecks = { '경로 수정': true }
        output = 'R2 정적 경로 수정됨. 두 PC의 양방향 결과를 확인하세요.'
      } else if (ctx.extended && ctx.target === 'R1' && input === 'ip route 192.168.30.0 255.255.255.0 10.0.0.2') {
        extraFixed = true
        nextChecks = {}
        output = 'R1 추가 대역 경로 수정됨. 기존 두 방향과 PC-C를 다시 확인하세요.'
      } else {
        output = '목적지·마스크·실제 인접 주소와 실행 대상을 비교하세요. 설정은 변경되지 않았습니다.'
      }
    } else if (input.startsWith('ping ')) {
      const gwA = ctx.target === 'PC-A' && input === 'ping 192.168.10.1'
      const gwB = ctx.target === 'PC-B' && input === 'ping 192.168.20.1'
      const forward = ctx.target === 'PC-A' && input === 'ping 192.168.20.10'
      const reverse = ctx.target === 'PC-B' && input === 'ping 192.168.10.10'
      const extra = ctx.extended && ctx.target === 'PC-A' && input === 'ping 192.168.30.10'
      if (gwA || gwB) {
        output = 'Reply received · 4/4 · 0% loss (기본 게이트웨이 응답 정상)'
      } else if (!forward && !reverse && !extra) {
        output = 'PC-A에서 지사 PC 또는 추가 단말, PC-B에서 본사 PC를 확인하세요.'
      } else if (!student.routeFixed || (extra && !extraFixed)) {
        output = 'Request timed out. Sent = 4, Received = 0 (100% loss)'
        nextChecks[extra ? '추가 단말 PC-C' : forward ? '본사 → 지사' : '지사 → 본사'] = false
      } else {
        student = { ...student, forward: student.forward || forward, reverse: student.reverse || reverse }
        nextChecks[extra ? '추가 단말 PC-C' : forward ? '본사 → 지사' : '지사 → 본사'] = true
        nextChecks['경로 수정'] = true
        output = 'Reply received · 4/4 · 0% loss'
      }
    }
  } else {
    if (input === 'GET /schema') output = '{ answer, source_ids, status } · 문서 ID로 출처 연결'
    if (input === 'GET /status') {
      output = `답변 보류 규칙: ${ctx.rules[0] ? '설정' : '미설정'} / 식별 정보 가림: ${ctx.rules[1] ? '설정' : '미설정'}${ctx.extended ? ` / 공개 자료 조회: ${ctx.rules[2] ? '설정' : '미설정'}` : ''}`
    }
    const testCommands = ['TEST registered', 'TEST unknown', 'TEST privacy', ...(ctx.extended ? ['TEST offline'] : [])]
    const i = testCommands.indexOf(input)
    if (i >= 0) {
      const ok = i === 0 || ctx.rules[i - 1]
      nextChecks[ctx.conditions[i]] = ok
      output =
        i === 0
          ? '도서관 운영: 평일 09:00–18:00 · 가상 안내문 D01'
          : i === 1
            ? ok
              ? '자료 없음 · 추측 답변 중단. 담당 부서 확인 안내'
              : '보완 필요 · 자료가 없는 질문에 근거 없는 답변을 생성함'
            : i === 2
              ? ok
                ? '저장 기록: [학번 가림] 학생의 이용 문의'
                : '보완 필요 · 가짜 학번 20260001이 로그에 남음'
              : ok
                ? '외부 API 연결 없음 · 공개 안내문 D01 조회로 필수 안내 제공'
                : '보완 필요 · 외부 API 중단으로 응답 실패'
    }
  }

  const resetProgress = input.startsWith('ip route ') || /100% loss|보완 필요/.test(output)
  return { input, output, checks: nextChecks, student, extensionFixed: extraFixed, resetProgress }
}
