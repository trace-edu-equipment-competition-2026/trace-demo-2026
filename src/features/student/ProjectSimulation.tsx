import { useState } from 'react'
import { useWorkspace } from '@/components/layout/WorkspaceContext'
import { cycleOf, makeEvidence, stamp } from '@/domain/learningLoop'
import { executeSimulationCommand, getSimulationConfig, networkTopologySpecs } from '@/domain/simulationEngine'

export function ProjectSimulation() {
  const { scenario: s, data, setData } = useWorkspace()
  const changed = !!data.situation && ['active', 'complete'].includes(data.situation.status)
  const extended = changed && data.situation?.purpose !== '선행 단계 추가'
  const network = s.id === 'network'
  const config = getSimulationConfig(network, extended)

  const [target, setTarget] = useState(data.simulation?.target || s.nodes[0][0])
  const [command, setCommand] = useState('')
  const [rules, setRules] = useState(data.simulation?.rules || [false, false, ...(extended && s.id === 'fusion' ? [false] : [])])
  const [checks, setChecks] = useState<Record<string, boolean>>(data.simulation?.checks || {})
  const [extensionFixed, setExtensionFixed] = useState(data.simulation?.extensionFixed ?? false)
  const [lines, setLines] = useState<string[]>(
    data.simulation?.lines || ['TRACE 모의 실행 환경 · 실제 장비·코드·API에는 연결되지 않습니다.'],
  )
  const [note, setNote] = useState(data.simulation?.note ?? data.experimentNote)
  const [notice, setNotice] = useState('')

  function persist(next: Partial<NonNullable<typeof data.simulation>>) {
    setData({
      ...data,
      ...(next.checks
        ? {
            experiment: false,
            student: { ...data.student, submitted: false },
            situation: data.situation?.status === 'complete' ? { ...data.situation, status: 'active' as const } : data.situation,
          }
        : {}),
      simulation: { target, rules, checks, lines, note, extensionFixed, ...next },
    })
  }

  const passed = config.conditions.every(c => checks[c]) && rules.every(Boolean) && (!changed || !!data.situation?.response)

  function run(value = command) {
    const result = executeSimulationCommand(value, {
      isNetwork: network,
      extended,
      target,
      rules,
      checks,
      student: data.student,
      extensionFixed,
      conditions: config.conditions,
    })
    if (!result) return

    const nextLines = [...lines, `${stamp()} · ${target}> ${result.input}`, result.output].slice(-100)
    setChecks(result.checks)
    setExtensionFixed(result.extensionFixed)
    setLines(nextLines)
    setCommand('')
    setData({
      ...data,
      ...(result.resetProgress
        ? {
            experiment: false,
            situation: data.situation?.status === 'complete' ? { ...data.situation, status: 'active' as const } : data.situation,
          }
        : {}),
      student: result.student,
      simulation: {
        target,
        rules,
        checks: result.checks,
        lines: nextLines,
        note,
        extensionFixed: result.extensionFixed,
      },
    })
  }

  function publish() {
    if (!passed || !note.trim()) return
    const raw = `모의 실행 · ${stamp()} · 수행 회차 ${cycleOf(data) + 1}\n조건: ${config.labels.filter((_, i) => rules[i]).join(' / ')}\n${data.situation?.title ?? '초기 과제 조건'}\n\n${lines.join('\n')}\n\n검증 결과\n${Object.entries(checks).map(([k, v]) => `${k}: ${v ? '통과' : '실패'}`).join('\n')}`
    const e = makeEvidence(data, s, {
      title: config.title,
      detail: note.trim(),
      raw,
      owner: '유송민',
      source: '프로젝트 작업실 · 모의 검증',
      criterion: '검증',
      stage: 3,
      kind: 'record',
      time: stamp(),
    })
    const resource = {
      id: `project-verification-${e.id}`,
      name: config.title,
      kind: 'Learning Evidence',
      body: `${raw}\n\n학생 설명\n${note.trim()}`,
      author: '유송민',
      version: 1,
    }
    setData({
      ...data,
      experiment: true,
      experimentNote: note.trim(),
      completed: [...new Set([...data.completed, 'test'])],
      evidence: [...data.evidence, e],
      situation: changed && data.situation ? { ...data.situation, status: 'complete' } : data.situation,
      student: {
        ...data.student,
        submitted: true,
        resources: [...data.student.resources, resource],
        teamMessages: [
          ...data.student.teamMessages,
          { author: '유송민', text: `${config.title}과 판단 근거를 팀 자료에 공유했습니다.`, time: stamp() },
        ],
      },
    })
    setNotice('검증 결과를 팀 자료와 나의 학습 기록에 남겼습니다. 원자료와 학생 설명을 따로 보존했습니다.')
  }

  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <h2>실행 환경과 검증</h2>
          <span className="teach-badge yellow">모의 실행</span>
        </div>
        <p className="section-note">{data.plan.scope}</p>
        {network && (
          <div className="fault-lab-banner">
            <div>
              <strong>Network Fault Lab</strong>
              <span className={`teach-badge ${data.student.routeFixed ? 'mint' : 'rose'}`}>
                {data.student.routeFixed ? '경로 복구됨 · 양방향 검증 진행' : '통신 장애'}
              </span>
            </div>
            <small>
              실습 화면의 구성 개념도입니다. 실제 코드에서 구현·검증된 시뮬레이터 화면은 아닙니다. 장비를 선택해 설정과 경로를 직접 조회하세요.
            </small>
          </div>
        )}
        <div className="network-topology" aria-label="프로젝트 구성도">
          {network
            ? networkTopologySpecs.map(node => (
                <div
                  key={node.id}
                  className={target === node.id ? 'selected-node' : ''}
                  onClick={() => {
                    setTarget(node.id)
                    persist({ target: node.id })
                  }}
                >
                  <span>
                    {node.id} <small>({node.role})</small>
                  </span>
                  <small>{node.ip}</small>
                  <small>{node.detail}</small>
                </div>
              ))
            : s.nodes.map(([name, info]) => (
                <div key={name}>
                  <span>{name}</span>
                  <small>{info}</small>
                </div>
              ))}
        </div>
        <div className="fusion-prototype">
          <div>
            <h3>검증 조건</h3>
            {config.labels.map((label, i) => (
              <label className="student-learning-check" key={label}>
                <input
                  type="checkbox"
                  checked={!!rules[i]}
                  onChange={e => {
                    const nextRules = config.labels.map((_, j) => (i === j ? e.target.checked : !!rules[j]))
                    setRules(nextRules)
                    setChecks({})
                    persist({ rules: nextRules, checks: {} })
                    setNotice('조건이 바뀌었습니다. 결과를 다시 확인해 주세요.')
                  }}
                />
                {label}
              </label>
            ))}
            <label className="field">
              실행 대상
              <select
                aria-label="실행 대상"
                value={target}
                onChange={e => {
                  setTarget(e.target.value)
                  persist({ target: e.target.value })
                }}
              >
                {s.nodes.map(n => (
                  <option key={n[0]}>{n[0]}</option>
                ))}
              </select>
            </label>
            <p className="course-demo-note">{s.moduleEvidence} · 시연용으로 정의된 요청만 처리합니다.</p>
            {network && (
              <details>
                <summary>설정 명령 형식</summary>
                <p>ip route 목적지대역 서브넷마스크 다음홉</p>
                <p>조회한 경로와 실제 연결을 비교해 각 값을 직접 선택하세요.</p>
              </details>
            )}
          </div>
          <div>
            <pre role="log" aria-label="모의 실행 기록" className="student-console">
              {lines.join('\n')}
            </pre>
            <form
              className="console-form"
              onSubmit={e => {
                e.preventDefault()
                run()
              }}
            >
              <label htmlFor="project-command">명령·요청</label>
              <input
                id="project-command"
                placeholder={config.placeholder}
                value={command}
                onChange={e => setCommand(e.target.value)}
              />
              <button className="button primary">실행</button>
            </form>
          </div>
        </div>
        <div className="command-shortcuts">
          {config.commands.map(c => (
            <button className="text-button" key={c} onClick={() => run(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="fusion-test-checks">
          {config.conditions.map(c => (
            <span key={c} className={checks[c] ? 'passed' : ''}>
              {checks[c] === undefined ? '미확인' : checks[c] ? '확인 완료' : '보완 필요'} · {c}
            </span>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="section-heading">
          <div className="form-heading-copy">
            <h2>수행자료와 검증 기록</h2>
            <small className="form-heading-note">
              AI가 대화 내용과 입력 자료를 대조하고, 추가 질문으로 보완하여 과정증거로 활용하는 흐름입니다. (기능 설계 시연)
            </small>
          </div>
          <span className="count-label">원자료 + 나의 설명</span>
        </div>
        <label className="field">
          어떤 근거로 판단했고, 무엇을 더 확인해야 하나요?
          <textarea
            rows={4}
            value={note}
            onChange={e => {
              setNote(e.target.value)
              persist({ note: e.target.value })
            }}
            placeholder={s.guidance}
          />
        </label>
        <p className="course-demo-note">
          {extended
            ? '변경 조건에 대한 재분석·팀 합의와 모든 시험 결과를 확인한 뒤 공유하세요.'
            : '모든 결과와 검증 조건을 확인한 뒤 판단 근거를 남기세요.'}{' '}
          공유 시점의 실행 기록을 별도로 보존하며 이전 회차의 근거는 유지됩니다.
        </p>
        <button className="button primary" disabled={!passed || !note.trim()} onClick={publish}>
          검증 근거 팀에 공유
        </button>
        {notice && <p role="status">{notice}</p>}
      </section>
    </>
  )
}
