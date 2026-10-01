export const evidenceStages = ['판단', '근거', '수정', '검증'] as const
export const evidenceKinds = { record:'수행 기록', plan:'계획', reflection:'자기 설명' } as const
export const evidenceKind = (e: Evidence) => e.kind || 'record'
export const isPerformedEvidence = (e: Evidence) => evidenceKind(e)==='record'
export const guidanceLevels = ['확인 질문', '탐색 범위', '개념 힌트', '도구 활용 힌트']
// 시연 규칙 기반 추정. 실제 AI 호출·검증된 채점 모델 아님.
export function criterionEstimate(criterion: string, weight: number, records: Evidence[]) {
  if(records.some(e=>e.live)){const stage=/문제 이해/.test(criterion)?0:/검증/.test(criterion)?3:/해결/.test(criterion)?2:-1;const ids=records.filter(e=>e.live&&(e.stage===stage||(/협업/.test(criterion)&&e.source.includes('합의')))).map(e=>e.id);return {remaining:'원자료·학생 판단·검증 조건을 대조한 교수자 확인',score:null,ratio:null,ids,reason:'학생이 새로 공유한 자료입니다. 내용 검토 전에는 점수를 추정하지 않습니다.'}}
  const has = (id: string) => records.some(e => e.id === id)
  const performed = (id: string) => records.some(e=>e.id===id&&isPerformedEvidence(e))
  let ratio: number | null = null
  let ids: string[] = []
  let reason = '이 평가 요소에 맞는 세부 기준과 근거를 먼저 연결해 주세요.'
  if (/문제 이해/.test(criterion)) { ratio = .9; ids = ['E01','E02']; reason = '문제 범위를 좁히고 실제 자료와 가설을 대조함. 다른 조건의 설명은 추가 확인.' }
  else if (/해결 과정|문제 해결/.test(criterion)) { ratio = performed('E03') ? .8 : null; ids = performed('E03') ? ['E02','E03'] : ['E02','E05']; reason = performed('E03') ? '원인 가설에 맞는 수정안과 이유가 연결됨. 대안 비교는 보완 필요.' : '진단 계획만 있으며 실제 수정 근거는 아직 없음.' }
  else if (/검증/.test(criterion)) { ratio = performed('E04') ? .8 : null; ids = performed('E04') ? ['E04','E05'] : ['E05']; reason = performed('E04') ? '명시한 조건별 실행 결과를 비교함. 다른 조건의 재검증은 남아 있음.' : '실행 결과 미수집. 계획만으로 검증 충족분을 산정하지 않음.' }
  else if (/산출물/.test(criterion)) { ratio = performed('E03') ? .6 : .3; ids = ['E05']; reason = '과정 문서의 현재 초안만 반영. 최종 보고서 완성도는 추가 확인.' }
  else if (/협업/.test(criterion)) { ratio = .7; ids = ['E05']; reason = '판단과 다음 행동을 팀 문서에 공유함. 역할 간 조율 결과는 추가 확인.' }
  ids = ids.filter(has)
  if (!ids.length || !Number.isFinite(weight) || weight <= 0) ratio = null
  const remaining = ratio===null ? '판단에 필요한 실제 수행 자료를 추가로 확인해 주세요.' : /검증/.test(criterion) ? '기록한 조건 밖에서의 재검증과 결과 설명' : /문제/.test(criterion) ? '다른 조건에서도 같은 판단을 할 수 있는지 설명' : /해결/.test(criterion) ? '대안과 비교한 선택 이유 및 수정 이후 결과' : /협업/.test(criterion) ? '역할 간 조율 과정과 다른 팀원의 확인' : '최종 산출물의 완성도와 요구 조건 충족 여부'
  return { remaining, score: ratio === null ? null : Math.round(weight * ratio * 10) / 10, ratio, ids, reason }
}
export type Evidence = {
  live?:boolean; id: string; stage: number; title: string; time: string; source: string; goal: string;
  raw: string; explanation: string; interpretation: string; limitation: string; shared?: boolean; kind?: keyof typeof evidenceKinds;
}
export type GuidanceEvent = { time: string; level: number; reason: string; support: string; response: string; evidence: string }
export const snapshotMinutes = 14 * 60 + 31
export const formatTime = (minutes: number) => `${Math.floor(minutes/60)}:${String(minutes%60).padStart(2,'0')}`
export const teachingTeams = [
  { id:1, progress:72, stage:'결과 검증', status:'정상' as const, minutesAgo:5, summary:'두 단말의 양방향 통신 결과가 기록되어 있습니다. 다른 단말에서도 같은 조건이 성립하는지 확인하는 단계입니다.', reasons:['정상·장애 구간 비교 기록 있음','검증 범위를 다른 단말로 확장 중'] },
  { id:2, progress:48, stage:'수정 단계', status:'확인 필요' as const, minutesAgo:18, summary:'설정 수정과 검증 계획은 기록되어 있으나 실행 결과가 아직 없습니다. 복구 여부를 어떻게 확인할지 학생의 계획을 살펴봐 주세요.', reasons:['18분간 후속 수행 기록 없음','설정 수정 후 양방향 통신 결과 미수집','검증 계획의 실행 여부 확인 필요'] },
  { id:3, progress:66, stage:'결과 검증', status:'승인 대기' as const, minutesAgo:3, summary:'두 단말에서 연결을 확인했습니다. 다른 대역으로 검증 범위를 넓히는 상황 제안이 승인 대기 중입니다.', reasons:['기록된 검증 대상은 두 단말','다른 대역의 검증을 위한 상황 제안'] },
  { id:4, progress:35, stage:'원인 분석', status:'지연' as const, minutesAgo:32, summary:'설정을 비교하고 다음 진단 계획을 작성한 뒤 새 기록이 없습니다. 수정안을 고르기 어려운지 교수자의 확인이 필요합니다.', reasons:['32분간 새 수행 기록 없음','설정 비교 이후 수정·검증 자료 미수집'] },
  { id:5, progress:84, stage:'결과 검증', status:'정상' as const, minutesAgo:2, summary:'수정 전·후 결과를 비교하고 양방향 통신을 확인했습니다. 결과를 자기 설명으로 정리하고 있습니다.', reasons:['양방향 검증 결과 기록','판단과 수정 과정을 설명한 자료 있음'] },
  { id:6, progress:61, stage:'수정 단계', status:'정상' as const, minutesAgo:7, summary:'설정을 수정하고 검증 대상을 정했습니다. 계획한 양방향 검증의 후속 결과를 기다리고 있습니다.', reasons:['수정 이유와 설정 변경 기록 있음','팀 내 검증 계획 공유'] },
].map(t=>({...t,recent:`${t.minutesAgo}분 전`}))

// 가상 기록. 시간·작성자·누락 증거 명시. 능력 점수 아님.
export function studentEvidence(name: string, role: string, team: number, vlan: boolean) {
  const incomplete = [2,4,6].includes(team)
  const hasModification = team !== 4
  const diagnosing = role === '장애 원인 분석'
  const logging = role === '과정 기록·공유'
  const subject = vlan ? 'VLAN 소속 불일치' : 'R2의 반환 경로 누락'
  let evidence: Evidence[] = [
    { id: 'E01', stage: 0, title: '장애 구간에 대한 첫 가설', time: '14:05', source: '학생 판단 노트', goal: '장애 원인을 근거로 설명하기', raw: vlan ? '같은 부서의 PC-A와 PC-B가 서로 다른 VLAN에 배치되어 있다.' : 'PC-A → 게이트웨이 응답 정상. 지사 PC까지는 실패. R1 이후 경로 또는 돌아오는 경로를 확인해야 한다.', explanation: '가까운 장비까지는 연결되므로 전체 장비를 초기화하기보다 실패 구간을 좁히겠습니다.', interpretation: '관찰 결과를 사용해 원인 후보의 범위를 좁힌 흔적이 있습니다.', limitation: '최초 가설이며, 원인이 확정된 것은 아닙니다.' },
    { id: 'E02', stage: 1, title: vlan ? '단말별 VLAN 소속 비교' : '양방향 라우팅 테이블 비교', time: '14:09', source: logging ? '팀 기록 · 자료 비교 메모' : '실습 모듈 · 명령 실행', goal: '진단 도구로 원인 가설 점검하기', raw: vlan ? 'SW1# show vlan brief\n10  STAFF   active  Fa0/1\n20  GUEST   active  Fa0/2\n동일 부서 단말: PC-A(Fa0/1), PC-B(Fa0/2)' : 'R1# show ip route\nS 192.168.20.0/24 via 10.0.0.2\nR2# show ip route\nC 192.168.20.0/24 directly connected\nC 10.0.0.0/30 directly connected\n192.168.10.0/24로 가는 경로: 없음', explanation: `${subject}을 실제 설정과 대조했습니다. ${vlan ? '두 단말의 부서 조건을 다시 확인했습니다.' : '요청이 도착하더라도 응답이 돌아오지 못할 수 있습니다.'}`, interpretation: '설정과 가설을 비교한 근거가 있습니다. 개념을 다른 조건에도 적용하는지는 추가 질문으로 확인할 수 있습니다.', limitation: logging ? '실행은 팀 공유 자료입니다. 이 학생에게 확인되는 행동은 비교·기록입니다.' : '명령 실행 기록만으로 개념 이해를 확정하지 않습니다.', shared: logging },
    { id: 'E03', kind: diagnosing ? 'plan' : 'record', stage: 2, title: diagnosing ? '수정안 제안 및 근거 공유' : logging ? '설정 변경 전·후 기록' : vlan ? '단말 VLAN 소속 수정' : 'R2 정적 경로 수정', time: '14:11', source: diagnosing || logging ? '팀 문서 · 학생 작성' : '실습 모듈 · 설정 변경', goal: '가설에 맞는 수정안을 선택하기', raw: vlan ? '변경 전: Fa0/2 → VLAN 20\n변경 후: Fa0/2 → VLAN 10\n부서별 네트워크 표와 비교하여 적용' : '변경 전: 192.168.10.0/24 반환 경로 없음\n변경안: ip route 192.168.10.0 255.255.255.0 10.0.0.1\n대상 장비: R2', explanation: `${subject}에 대응하도록 ${diagnosing ? '수정안을 제안' : logging ? '변경 내용을 기록' : '설정을 변경'}했습니다. 다른 원인 후보는 검증 결과를 보고 다시 살펴보겠습니다.`, interpretation: `${diagnosing ? '원인 가설과 수정안의 연결' : logging ? '변경 과정의 구분' : '가설에 따른 설정 변경'}이 자료에 나타납니다.`, limitation: '설정 변경과 장애 복구 성공은 별도로 확인해야 합니다.' },
    ...(!incomplete ? [{ id: 'E04', stage: 3, title: '복구 후 양방향 통신 확인', time: '14:12', source: diagnosing || logging ? '팀 공유 · 검증 결과' : '실습 모듈 · 검증 결과', goal: '수정 결과를 조건별로 검증하기', raw: vlan ? 'PC-A(192.168.10.10) → PC-B(192.168.10.20): ping 4/4 응답\nPC-B → PC-A: ping 4/4 응답\nSW1# show vlan brief\n10 STAFF active Fa0/1, Fa0/2' : 'PC-A → PC-B: ping 4/4 응답\nPC-B → PC-A: ping 4/4 응답\ntracert: R1 → R2 → PC-B 도달', explanation: '한 방향 성공만으로는 부족하므로 반대 방향도 확인했습니다. 변경 전 결과와 비교해 실패 구간이 해소되었는지 점검했습니다.', interpretation: '명시한 두 방향의 복구 근거가 있습니다. 모든 단말의 정상 동작을 보장하는 자료는 아닙니다.', limitation: diagnosing || logging ? '팀 결과를 해석한 설명입니다. 검증 명령을 직접 실행했는지는 별도 확인이 필요합니다.' : '검증 범위는 기록된 두 단말입니다.', shared: diagnosing || logging }] : []),
    { id: 'E05', kind: incomplete ? 'plan' : 'reflection', stage: incomplete ? 2 : 3, title: incomplete ? '다음 검증 계획과 팀 공유' : '해결 과정 자기 설명', time: '14:14', source: '학생 성찰 · 팀 문서', goal: '판단과 검증 과정을 설명하기', raw: incomplete ? '다음에 양쪽 PC에서 ping을 실행하고 결과를 비교하겠습니다. 현재는 수정 내용만 공유했습니다.' : `원인: ${subject}\n근거: 정상 구간과 장애 구간 비교\n수정 후: 양방향 통신 결과 대조`, explanation: incomplete ? '설정은 바꿨지만 아직 복구 여부를 말할 수 없습니다. 팀원과 검증 대상을 나눠 확인하겠습니다.' : 'AI의 탐색 방향을 참고했지만 실제 설정과 비교한 뒤 수정했습니다. 최종 판단은 실행 결과로 확인했습니다.', interpretation: incomplete ? '검증이 필요하다는 인식과 계획이 나타납니다. 실제 수행 결과는 아직 수집되지 않았습니다.' : '지원 내용을 그대로 복사하기보다 실제 결과와 연결해 설명한 흔적이 있습니다.', limitation: '자기 보고와 실제 실행 자료를 함께 확인해 주세요.' },
  ]
  if (!hasModification) {
    evidence = evidence.filter(e=>e.id!=='E03').map(e=>e.id==='E05' ? { ...e, stage:1, title:'다음 진단 계획과 팀 공유', raw:'설정 비교 후 원인 후보를 정리했습니다. 수정안을 선택하기 전에 정상 경로와 비교하겠습니다.', explanation:'원인 후보는 있지만 아직 설정을 변경하지 않았습니다. 수정의 근거를 먼저 설명하겠습니다.', interpretation:'진단 계획은 있습니다. 실제 수정·검증 자료는 아직 수집되지 않았습니다.' } : e)
  }
  const guidance: GuidanceEvent[] = [
    { time:'14:04',level:1,reason:'첫 진단 이후 다음 행동을 정하지 못함',support:'이미 확인한 구간과 아직 확인하지 않은 구간을 구분하도록 질문',response:'게이트웨이까지 정상임을 설명하고 다음 확인 지점을 선택',evidence:'E01' },
    { time:'14:08',level:2,reason:'한쪽 방향의 설정만 확인함',support:vlan ? '정상·장애 단말의 소속 VLAN을 비교하도록 탐색 범위 제시' : '요청 경로와 반환 경로를 나눠 확인하도록 탐색 범위 제시',response:'AI 제안을 실제 설정과 비교한 뒤 원인 후보 수정',evidence:'E02' },
    ...(incomplete ? [
      { time:'14:10',level:3,reason:'설정 변경과 복구 성공을 혼동할 가능성',support:'통신은 요청과 응답이 모두 도달해야 성립한다는 개념 상기',response:'설정 변경만으로 복구를 확정할 수 없다고 설명',evidence:'E03' },
      { time:'14:12',level:4,reason:'검증 대상과 확인 방법을 구체화할 필요',support:'ping과 tracert의 관찰 결과를 비교하는 도구 활용 힌트',response:'양방향 검증 계획 작성 · 실행 결과는 미수집',evidence:'E05' },
    ] : []),
    { time:'14:13',level:1,reason:incomplete ? '검증 계획을 학생이 직접 선택함' : '학생이 수정·검증을 스스로 진행함',support:'판단 근거와 다음 확인 항목을 스스로 설명하도록 지원 축소',response:incomplete ? '검증 계획 설명 · 후속 결과 확인 필요' : '수정 전·후 결과를 근거로 해결 과정 설명',evidence:'E05' },
  ]
  if (!hasModification) {
    guidance[2] = { ...guidance[2], reason:'원인 후보와 수정안의 연결이 필요함', support:'가설을 지지하거나 제외할 관찰 결과를 구분하는 개념 힌트', response:'수정 전 정상 설정과 비교할 계획 작성', evidence:'E05' }
    guidance[3] = { ...guidance[3], reason:'다음 진단 도구 선택에 어려움', support:'설정 조회 결과를 정상 경로와 비교하는 도구 활용 힌트', response:'설정 비교 계획 공유 · 후속 실행 자료 미수집', evidence:'E05' }
    guidance[4] = { ...guidance[4], reason:'학생이 다음 진단 계획을 선택함', response:'진단 계획 설명 · 수정과 검증은 아직 미수행' }
  }
  const offset = snapshotMinutes - teachingTeams[team-1].minutesAgo - (14*60+14)
  const shifted = (time:string) => { const [h,m]=time.split(':').map(Number);return formatTime(h*60+m+offset) }
  return { name, role, team, incomplete, hasModification, evidence:evidence.map(e=>({...e,time:shifted(e.time)})), guidance:guidance.map(g=>({...g,time:shifted(g.time)})) }

}
