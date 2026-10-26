import {
  Plus,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  UsersRound,
  UserRound,
  Settings,
  FilePenLine,
  ListChecks,
  Menu,
  Save,
  Download,
} from 'lucide-react'
import { Fragment, useEffect, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react'
import { type Assignment as AssignmentType, modes, storageKey, suggestGoals, validateAssignment } from '@/domain/assignment'
import { demoLessonOverview, type Course } from '@/domain/course'
import { StudentPreview } from './StudentPreview'
import { OptionEditor } from './OptionEditor'
import { TeamBuilder } from './TeamBuilder'
import { ExecutionEnvironment } from './ExecutionEnvironment'
import { workspaceKey } from '@/domain/scenarios'
import { useWorkspace, useWorkspaceUi } from '@/components/layout/WorkspaceContext'

type IconName = 'plus' | 'close' | 'check' | 'right' | 'left' | 'users' | 'user' | 'settings' | 'edit' | 'list' | 'menu' | 'save' | 'download'

const icons = {
  plus: Plus,
  close: X,
  check: Check,
  right: ArrowRight,
  left: ArrowLeft,
  users: UsersRound,
  user: UserRound,
  settings: Settings,
  edit: FilePenLine,
  list: ListChecks,
  menu: Menu,
  save: Save,
  download: Download,
}

function Icon({ name }: { name: IconName }) {
  const Component = icons[name]
  return <Component size={20} strokeWidth={1.8} className="trace-icon" aria-hidden="true" />
}

function Remove({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="icon-button remove" aria-label={label} onClick={onClick}>
      <Icon name="close" />
    </button>
  )
}

function Section({
  title,
  number,
  action,
  children,
  className = '',
}: {
  title: string
  number: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="section-heading">
        <h2>
          <span className={`section-number tone-${Number(number) % 5}`}>{number}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function AssignmentBuilder({
  assignment: a,
  setAssignment: setA,
  course,
  saved,
  setSaved,
  created,
  setCreated,
  error,
  setError,
  sidebarOpen,
  onOpenSidebar,
  onMessage,
  onPublish,
}: {
  assignment: AssignmentType
  setAssignment: Dispatch<SetStateAction<AssignmentType>>
  course: Course
  saved: boolean
  setSaved: (v: boolean) => void
  created: boolean
  setCreated: (v: boolean) => void
  error: string
  setError: (v: string) => void
  sidebarOpen: boolean
  onOpenSidebar: () => void
  onMessage: (msg: string) => void
  onPublish: (a: AssignmentType) => void
}) {
  const { scenario } = useWorkspace()
  const { step, setStep } = useWorkspaceUi()
  const key = (k: string) => workspaceKey(scenario.id, k)

  const [newGoal, setNewGoal] = useState('')
  const [editingGoal, setEditingGoal] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [ncsLinked, setNcsLinked] = useState(true)
  const lessonOverview = demoLessonOverview[scenario.id]

  function applyDemoProposal() {
    setA(prev => ({
      ...prev,
      title: lessonOverview.proposalTitle,
      description: lessonOverview.proposalSummary,
    }))
    setSaved(false)
    setCreated(false)
    setError('')
    onMessage('AI 과제 제안(본사–지사 네트워크 통신 장애 복구)을 과제 설계안에 반영했습니다.')
  }

  const dialog = useRef<HTMLDialogElement>(null)
  const pageTitle = useRef<HTMLHeadingElement>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timeout.current), [])

  function update<K extends keyof AssignmentType>(field: K, value: AssignmentType[K]) {
    setA(prev => ({ ...prev, [field]: value }))
    setSaved(false)
    setCreated(false)
    setError('')
  }

  function changeStep(next: number) {
    if (next > 1) {
      const issue = validateAssignment(a, next === 3)
      if (issue) {
        setError(issue)
        return
      }
    }
    setStep(next)
    setError('')
    window.scrollTo({ top: 0 })
    requestAnimationFrame(() => pageTitle.current?.focus({ preventScroll: true }))
  }

  function save(create = false) {
    if (create) {
      const issue = validateAssignment(a, true)
      if (issue) {
        setError(issue)
        return
      }
    }
    try {
      localStorage.setItem(key(storageKey), JSON.stringify(a))
      if (create) onPublish(a)
      setSaved(true)
      setCreated(create)
      setError('')
      onMessage(
        create
          ? '과제가 생성되었습니다. 학생 안내와 AI 지원 범위에 적용했어요.'
          : '임시 저장했습니다. 다음 접속에서도 이어서 작성할 수 있어요.',
      )
    } catch {
      setError('저장 공간을 사용할 수 없습니다. 브라우저 설정을 확인해 주세요.')
    }
  }

  function addGoal() {
    if (!newGoal.trim()) return
    update('goals', [...a.goals, newGoal.trim()])
    setNewGoal('')
  }

  function improveBrief() {
    if (!a.title.trim() || !a.description.trim()) {
      setError('과제명과 과제 설명을 먼저 입력해 주세요.')
      return
    }
    const networkTask = /네트워크|라우팅|장애/.test(`${a.title} ${a.description}`)
    const title = networkTask
      ? '교내 네트워크 장애 원인 진단 및 복구 검증'
      : a.title.includes('검증')
        ? a.title.trim()
        : `${a.title.trim()} · 수행 과정과 결과 검증`
    const description = networkTask
      ? '실습실 네트워크의 연결 장애를 팀별로 진단하고 복구하세요. 관찰한 증상과 진단 근거를 바탕으로 원인을 좁히고, 해결 과정을 기록한 뒤 복구 전·후 연결 상태를 직접 검증합니다.'
      : `${a.description.trim()} 수행 과정에서 선택한 방법과 판단 근거를 기록하고, 적용 전·후 결과를 비교하여 해결 여부를 직접 검증하세요.`
    setA(prev => ({ ...prev, title, description }))
    setSaved(false)
    setCreated(false)
    setError('')
    onMessage('AI가 과제 문장을 수행과 검증 중심으로 강화했습니다.')
  }

  function recommendRequirements() {
    if (!a.title.trim() || !a.description.trim()) {
      setError('요구사항을 추천받기 전에 과제명과 설명을 입력해 주세요.')
      return
    }
    const networkTask = /네트워크|라우팅|장애/.test(`${a.title} ${a.description}`)
    const recommendations = networkTask
      ? [
          '장애 증상을 재현하고 영향 범위를 확인한 결과를 기록한다.',
          '두 가지 이상의 진단 도구를 활용하여 원인 후보를 비교한다.',
          '설정 변경 전·후 상태를 비교하고 복구 결과를 다른 팀원이 재검증한다.',
        ]
      : [
          '문제 상황을 분석하고 해결에 필요한 조건을 구체적으로 정의한다.',
          '선택한 해결 방법의 근거와 수행 과정을 단계별로 기록한다.',
          '적용 전·후 결과를 비교하고 동료가 확인할 수 있는 검증 근거를 남긴다.',
        ]
    update('requirements', [...new Set([...a.requirements, ...recommendations])])
    onMessage('과제 내용에 맞는 평가 요구사항을 추가했습니다.')
  }

  function openSuggestions() {
    if (!a.title.trim()) {
      setError('목표를 불러오기 전에 과제명을 입력해 주세요.')
      return
    }
    setSelectedGoals([])
    setLoading(true)
    setSuggestions([])
    dialog.current?.showModal()
    timeout.current = setTimeout(() => {
      setSuggestions([
        ...new Set([...course.goals, ...(scenario.id === 'network' ? suggestGoals(a.title) : scenario.assignment.goals)]),
      ])
      setLoading(false)
    }, 600)
  }

  function toggleGuidance(value: string) {
    const current = a.guidance[a.mode]
    update('guidance', {
      ...a.guidance,
      [a.mode]: current.includes(value) ? current.filter(x => x !== value) : [...current, value],
    })
  }

  async function uploadTemplate(file: File | undefined, index: number) {
    if (!file) return
    // ponytail: 데모 첨부는 로컬 저장. 서비스 전환 시 서버 파일 저장소 사용.
    if (file.size > 2 * 1024 * 1024) {
      setError('데모 양식은 파일당 2MB 이하로 첨부해 주세요.')
      return
    }
    const reader = new FileReader()
    reader.onerror = () => setError('양식을 읽지 못했습니다. 파일을 다시 선택해 주세요.')
    reader.onload = () => {
      setSaved(false)
      setCreated(false)
      setError('')
      setA(prev => ({
        ...prev,
        outputs: prev.outputs.map((out, i) =>
          i === index ? { ...out, template: { name: file.name, data: String(reader.result) } } : out,
        ),
      }))
    }
    reader.readAsDataURL(file)
  }

  const total = a.criteria.reduce((s, c) => s + c.weight, 0)
  const expectedTeams = Math.ceil(24 / Math.max(2, a.teamSize))

  return (
    <>
      <header className="page-header">
        <div className="title-row">
          <button
            className="mobile-menu icon-button"
            aria-label="수업 메뉴 열기"
            aria-expanded={sidebarOpen}
            onClick={onOpenSidebar}
          >
            <Icon name="menu" />
          </button>
          <h1 ref={pageTitle} tabIndex={-1}>
            프로젝트 · 과제 생성
          </h1>
          <span className="draft-badge">{created ? '생성 완료' : '작성 중'}</span>
        </div>
        <p>과제를 설계하고, 학생의 수행을 지원할 AI 운영 방식을 정하세요.</p>
      </header>

      <div className="workflow">
        <div className="step-tabs" aria-label="과제 생성 단계">
          {['과제 설계', 'AI 운영 방식', '학생 미리보기'].map((label, i) => (
            <Fragment key={label}>
              <button
                className={step === i + 1 ? 'current' : step > i + 1 ? 'complete' : ''}
                aria-current={step === i + 1 ? 'step' : undefined}
                onClick={() => changeStep(i + 1)}
              >
                <span>{step > i + 1 ? <Icon name="check" /> : i + 1}</span>
                {label}
              </button>
              {i < 2 && <span className="step-connector" />}
            </Fragment>
          ))}
        </div>
        <span className="step-count">
          STEP {String(step).padStart(2, '0')} <span>/ 03</span>
        </span>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault()
          if (step < 3) changeStep(step + 1)
          else save(true)
        }}
        noValidate
      >
        {step === 1 ? (
          <>
            <section className="panel design-triptych-panel" aria-label="차시 과제 설계 3단 요약">
              <div className="triptych-card">
                <span className="teach-badge mint">① 교육적 요구사항</span>
                <h3>차시 목표와 필수 수행 행동</h3>
                <ul className="triptych-list">
                  <li>
                    <strong>이번 목표:</strong> {lessonOverview.objective}
                  </li>
                  <li>
                    <strong>선수학습:</strong> {lessonOverview.prerequisite}
                  </li>
                  <li>
                    <strong>직접 수행 행동:</strong> 장비 상태 확인 → 라우팅 테이블 비교 → 설정 수정 → 양방향 검증 및 이유 기록
                  </li>
                  <li>
                    <strong>AI 활용·평가:</strong> {a.mode} (개입 {a.intervention}) · 평가 기준 {a.criteria.length}개 항목
                  </li>
                </ul>
              </div>
              <div className="triptych-card">
                <span className="teach-badge lavender">② 근거자료 연결</span>
                <h3>교육과정 · 교안 · 선택적 NCS</h3>
                <ul className="triptych-list">
                  <li>
                    <strong>국가 교육과정:</strong> {lessonOverview.curriculumBasis}
                  </li>
                  <li>
                    <strong>교수자 자료:</strong> {course.documents.map(d => d.name).join(' · ') || '수업계획서 · 교안'}
                  </li>
                </ul>
                <label className="ncs-optional-toggle">
                  <input type="checkbox" checked={ncsLinked} onChange={e => setNcsLinked(e.target.checked)} />
                  <span>{lessonOverview.optionalNcsBasis}</span>
                </label>
                <small className="micro-note">
                  {ncsLinked
                    ? `적용 중: ${course.ncs.join(' · ')}`
                    : '미적용: 국가 교육과정 성취기준만 기본 근거로 사용합니다.'}
                </small>
              </div>
              <div className="triptych-card proposal-card">
                <span className="teach-badge yellow">③ AI의 과제 제안</span>
                <h3>과제 제안: {lessonOverview.proposalTitle}</h3>
                <p>{lessonOverview.proposalSummary}</p>
                <small className="micro-note">{lessonOverview.briefingSummary}</small>
                <div className="proposal-card-actions">
                  <button type="button" className="button secondary" onClick={applyDemoProposal}>
                    AI 제안 과제 적용
                  </button>
                </div>
              </div>
            </section>
            <div className="design-grid">
            <Section
              number="01"
              title="기본 정보"
              className="basic-panel"
              action={
                <button type="button" className="text-button improve-button" onClick={improveBrief}>
                  <Icon name="settings" />
                  AI로 문장 강화
                </button>
              }
            >
              <div className="field">
                <label htmlFor="title">
                  과제명 <span className="required-dot">*</span>
                </label>
                <input id="title" value={a.title} onChange={e => update('title', e.target.value)} placeholder="과제명을 입력하세요" />
              </div>
              <div className="field">
                <label htmlFor="description">과제 설명</label>
                <textarea
                  id="description"
                  rows={3}
                  value={a.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="학생이 해결할 문제와 수행 내용을 입력하세요"
                />
              </div>
              <div className="basic-bottom">
                <fieldset>
                  <legend>수행 기간</legend>
                  <div className="date-range">
                    <input aria-label="시작일" type="date" value={a.start} onChange={e => update('start', e.target.value)} />
                    <span>—</span>
                    <input
                      aria-label="종료일"
                      type="date"
                      min={a.start}
                      value={a.end}
                      onChange={e => update('end', e.target.value)}
                    />
                  </div>
                </fieldset>
                <fieldset>
                  <legend>난이도</legend>
                  <div className="segmented">
                    {['하', '중', '상'].map(level => (
                      <button
                        type="button"
                        key={level}
                        aria-pressed={a.difficulty === level}
                        className={a.difficulty === level ? 'selected' : ''}
                        onClick={() => update('difficulty', level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </Section>

            <Section number="02" title="수행 방식" className="team-panel" action={<span className="count-label">수강생 24명</span>}>
              <fieldset>
                <legend>프로젝트 유형</legend>
                <div className="project-type">
                  {(['개인 프로젝트', '팀 프로젝트'] as const).map(type => (
                    <button
                      type="button"
                      key={type}
                      aria-pressed={a.projectType === type}
                      className={a.projectType === type ? 'selected' : ''}
                      onClick={() => update('projectType', type)}
                    >
                      <Icon name={type === '팀 프로젝트' ? 'users' : 'user'} />
                      {type}
                    </button>
                  ))}
                </div>
              </fieldset>
              {a.projectType === '팀 프로젝트' ? (
                <div className="team-options">
                  <fieldset>
                    <legend>팀 구성 방식</legend>
                    <div className="team-methods">
                      {(['학생 자율 구성', '교수자 지정', '자동 균형 배정'] as const).map((method, i) => (
                        <button
                          type="button"
                          key={method}
                          aria-pressed={a.teamFormation === method}
                          className={a.teamFormation === method ? 'selected' : ''}
                          onClick={() => update('teamFormation', method)}
                        >
                          <strong>{method}</strong>
                          <small>
                            {
                              [
                                '학생이 팀을 만들고 교수자가 최종 확인',
                                '교수자가 구성원을 직접 배치',
                                '시스템이 균형을 고려해 구성 초안 생성',
                              ][i]
                            }
                          </small>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="team-settings">
                    <div className="field">
                      <label htmlFor="team-size">팀당 인원</label>
                      <div className="number-field">
                        <input
                          id="team-size"
                          type="number"
                          min="2"
                          max="10"
                          value={a.teamSize}
                          onChange={e => update('teamSize', Number(e.target.value))}
                        />
                        <span>명</span>
                      </div>
                    </div>
                    <div className="team-count">
                      <span>예상 팀 수</span>
                      <strong>{expectedTeams}개 팀</strong>
                      <small>24명 기준 · 마지막 팀은 인원이 다를 수 있어요</small>
                    </div>
                    <div className="field">
                      <label htmlFor="team-deadline">팀 구성 완료일</label>
                      <input
                        id="team-deadline"
                        type="date"
                        max={a.start}
                        value={a.teamDeadline}
                        onChange={e => update('teamDeadline', e.target.value)}
                      />
                    </div>
                  </div>
                  <label className="approval-option">
                    <input
                      type="checkbox"
                      checked={a.approvalRequired}
                      onChange={e => update('approvalRequired', e.target.checked)}
                    />
                    <span>
                      <strong>교수자 최종 승인</strong>
                      <small>신청된 팀을 확인하고 구성원 이동이나 미배정 학생 배치를 조정합니다.</small>
                    </span>
                  </label>
                  <div className="team-flow">
                    <span>학생 팀 생성·참여</span>
                    <Icon name="right" />
                    <strong>교수자 확인·조정</strong>
                    <Icon name="right" />
                    <span>팀 구성 확정</span>
                  </div>
                  <p className="micro-note">학생 신청 후 팀별 구성원과 미배정 학생은 「팀별 모니터링」에서 확인합니다.</p>
                </div>
              ) : (
                <div className="individual-note">
                  <span className="evidence-icon">
                    <Icon name="user" />
                  </span>
                  <div>
                    <strong>학생이 개인별로 수행합니다</strong>
                    <p>팀 구성 없이 각 학생의 제출물과 Learning Evidence를 개별 평가합니다.</p>
                  </div>
                </div>
              )}
              {a.projectType === '팀 프로젝트' && (
                <TeamBuilder assignment={a} onChange={value => update('teamAssignments', value)} />
              )}
            </Section>

            <Section number="03" title="수행 환경" action={<span className="count-label">과목에 맞는 도구 연결</span>}>
              <ExecutionEnvironment value={a.environment} onChange={value => update('environment', value)} />
            </Section>

            <Section
              number="04"
              title="과제 목표"
              className="goals-panel"
              action={
                <button type="button" className="text-button" onClick={openSuggestions}>
                  <Icon name="download" />
                  과목 설정에서 불러오기
                </button>
              }
            >
              <p className="section-note">이 과제를 통해 학생이 도달할 목표</p>
              <div className="goal-chips">
                {a.goals.map((goal, i) => (
                  <div className="goal-chip" key={i}>
                    {editingGoal === i ? (
                      <input
                        aria-label={`목표 ${i + 1} 수정`}
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onBlur={() => {
                          if (editText.trim()) update('goals', a.goals.map((x, j) => (i === j ? editText.trim() : x)))
                          setEditingGoal(null)
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            e.currentTarget.blur()
                          }
                          if (e.key === 'Escape') {
                            setEditingGoal(null)
                          }
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="chip-label"
                        title="클릭해서 목표 수정"
                        onClick={() => {
                          setEditingGoal(i)
                          setEditText(goal)
                        }}
                      >
                        {goal}
                      </button>
                    )}
                    <Remove label={`목표 ${i + 1} 삭제`} onClick={() => update('goals', a.goals.filter((_, j) => i !== j))} />
                  </div>
                ))}
              </div>
              <div className="goal-add">
                <input
                  aria-label="새 과제 목표"
                  placeholder="목표를 직접 입력하세요"
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addGoal()
                    }
                  }}
                />
                <button type="button" className="icon-button" aria-label="목표 추가" disabled={!newGoal.trim()} onClick={addGoal}>
                  <Icon name="plus" />
                </button>
              </div>
              <p className="micro-note">목표를 누르면 수정할 수 있습니다.</p>
            </Section>

            <Section
              number="05"
              title="평가 요구사항"
              action={
                <div className="section-actions">
                  <span className="count-label">{a.requirements.length}개 항목</span>
                  <button type="button" className="text-button improve-button" onClick={recommendRequirements}>
                    <Icon name="settings" />
                    AI로 요구사항 추천
                  </button>
                </div>
              }
            >
              <div className="requirements">
                {a.requirements.map((value, i) => (
                  <div className="requirement-row" key={i}>
                    <span className="check-marker">
                      <Icon name="check" />
                    </span>
                    <textarea
                      rows={2}
                      aria-label={`요구사항 ${i + 1}`}
                      value={value}
                      onChange={e => update('requirements', a.requirements.map((x, j) => (j === i ? e.target.value : x)))}
                      placeholder="학생이 반드시 수행해야 할 행동이나 조건"
                    />
                    <Remove
                      label={`요구사항 ${i + 1} 삭제`}
                      onClick={() => update('requirements', a.requirements.filter((_, j) => j !== i))}
                    />
                  </div>
                ))}
              </div>
              <button type="button" className="add-button" onClick={() => update('requirements', [...a.requirements, ''])}>
                <Icon name="plus" />
                요구사항 추가
              </button>
            </Section>

            <Section number="06" title="요구 산출물" action={<span className="count-label">{a.outputs.length}개 산출물</span>}>
              <div className="output-head">
                <span>산출물명</span>
                <span>형식</span>
                <span>제출 조건</span>
                <span />
              </div>
              {a.outputs.map((out, i) => (
                <div className="output-item" key={i}>
                  <div className="output-row">
                    <input
                      aria-label={`산출물명 ${i + 1}`}
                      value={out.name}
                      placeholder="산출물명"
                      onChange={e =>
                        update(
                          'outputs',
                          a.outputs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                        )
                      }
                    />
                    <select
                      aria-label={`산출물 형식 ${i + 1}`}
                      value={out.format}
                      onChange={e =>
                        update(
                          'outputs',
                          a.outputs.map((x, j) => (j === i ? { ...x, format: e.target.value } : x)),
                        )
                      }
                    >
                      {['PDF', '문서', '이미지', '영상', '코드', '기타'].map(f => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                    <select
                      aria-label={`산출물 제출 조건 ${i + 1}`}
                      value={out.required}
                      onChange={e =>
                        update(
                          'outputs',
                          a.outputs.map((x, j) => (j === i ? { ...x, required: e.target.value } : x)),
                        )
                      }
                    >
                      <option>필수</option>
                      <option>선택</option>
                    </select>
                    <Remove
                      label={`산출물 ${i + 1} 삭제`}
                      onClick={() => update('outputs', a.outputs.filter((_, j) => j !== i))}
                    />
                  </div>
                  <div className="template-row">
                    <label className="template-upload">
                      <Icon name="plus" />
                      {out.template ? '양식 교체' : '양식 업로드'}
                      <input
                        type="file"
                        aria-label={`산출물 ${i + 1} 양식 업로드`}
                        onChange={e => {
                          uploadTemplate(e.target.files?.[0], i)
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {out.template ? (
                      <>
                        <a href={out.template.data} download={out.template.name}>
                          {out.template.name}
                        </a>
                        <Remove
                          label={`산출물 ${i + 1} 양식 삭제`}
                          onClick={() =>
                            update(
                              'outputs',
                              a.outputs.map((x, j) => (j === i ? { ...x, template: undefined } : x)),
                            )
                          }
                        />
                      </>
                    ) : (
                      <span>지정 양식 없음</span>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="add-button"
                onClick={() => update('outputs', [...a.outputs, { name: '', format: 'PDF', required: '필수' }])}
              >
                <Icon name="plus" />
                산출물 추가
              </button>
            </Section>

            <Section
              number="07"
              title="평가 기준"
              className="criteria-panel"
              action={
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    update(
                      'criteria',
                      course.criteria.map(c => ({ ...c })),
                    )
                    onMessage('과목 평가 기준을 불러왔습니다. 과제에 맞게 수정할 수 있어요.')
                  }}
                >
                  <Icon name="download" />
                  과목 기준 불러오기
                </button>
              }
            >
              <div className="criteria-layout">
                <div className="criteria-table">
                  <div className="criteria-head">
                    <span>평가 요소</span>
                    <span>반영 비율</span>
                    <span />
                  </div>
                  {a.criteria.map((c, i) => (
                    <div className="criteria-row" key={i}>
                      <label className="criteria-name">
                        <span className={`color-dot color-${i % 5}`} />
                        <input
                          aria-label={`평가 요소 ${i + 1}`}
                          value={c.name}
                          placeholder="평가 요소"
                          onChange={e =>
                            update(
                              'criteria',
                              a.criteria.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                            )
                          }
                        />
                      </label>
                      <div className="percent-input">
                        <input
                          aria-label={`반영 비율 ${i + 1}`}
                          type="number"
                          min="1"
                          max="100"
                          value={c.weight || ''}
                          onChange={e =>
                            update(
                              'criteria',
                              a.criteria.map((x, j) => (j === i ? { ...x, weight: Number(e.target.value) } : x)),
                            )
                          }
                        />
                        <span>%</span>
                      </div>
                      <Remove
                        label={`평가 요소 ${i + 1} 삭제`}
                        onClick={() => update('criteria', a.criteria.filter((_, j) => j !== i))}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => update('criteria', [...a.criteria, { name: '', weight: 0 }])}
                  >
                    <Icon name="plus" />
                    평가 요소 추가
                  </button>
                </div>
                <div className="weight-summary">
                  <div className="weight-total">
                    <span>반영 비율 합계</span>
                    <strong className={total !== 100 ? 'invalid' : ''}>
                      {total}
                      <small>%</small>
                    </strong>
                  </div>
                  <div className="weight-bar" aria-hidden="true">
                    {a.criteria.map((c, i) => (
                      <span key={i} className={`color-${i % 5}`} style={{ flex: Math.max(0, c.weight) }} />
                    ))}
                  </div>
                  <p className={total !== 100 ? 'invalid' : ''}>
                    {total === 100 ? (
                      <>
                        <Icon name="check" />
                        평가 비율이 모두 채워졌습니다.
                      </>
                    ) : (
                      '반영 비율의 합계를 100%로 맞춰 주세요.'
                    )}
                  </p>
                  <div className="weight-legend">
                    {a.criteria.map((c, i) => (
                      <span key={i}>
                        <i className={`color-dot color-${i % 5}`} />
                        {c.name || '새 평가 요소'} <b>{c.weight}%</b>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </div>
          </>
        ) : step === 3 ? (
          <StudentPreview assignment={a} />
        ) : (
          <div className="ai-page">
            <section className="panel ai-panel">
              <div className="section-heading">
                <h2>AI 운영 방식</h2>
                <span className="subtle">과제에 맞는 지원 방식을 선택하세요</span>
              </div>
              <div className="mode-tabs" role="tablist" aria-label="AI 운영 방식">
                {modes.map((mode, i) => (
                  <button
                    type="button"
                    id={`mode-${i}`}
                    role="tab"
                    aria-controls="mode-panel"
                    aria-selected={a.mode === mode}
                    key={mode}
                    className={a.mode === mode ? 'selected' : ''}
                    onClick={() => update('mode', mode)}
                    onKeyDown={e => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        e.preventDefault()
                        const index = (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3
                        update('mode', modes[index])
                        document.getElementById(`mode-${index}`)?.focus()
                      }
                    }}
                  >
                    <Icon name={i === 0 ? 'edit' : i === 1 ? 'settings' : 'check'} />
                    {mode}
                  </button>
                ))}
              </div>
              <div id="mode-panel" role="tabpanel" aria-labelledby={`mode-${modes.indexOf(a.mode)}`} className="mode-content" key={a.mode}>
                <p className="mode-description">
                  {a.mode === '교수자 직접'
                    ? '교수자가 상황과 가이던스를 작성하고 적용 시점을 정합니다.'
                    : a.mode === 'AI 자동'
                      ? '학생의 수행 상태에 맞춰 AI가 상황과 가이던스를 제공합니다.'
                      : '프로젝트 논의와 일반 질문은 바로 지원합니다. 선행 단계·심화 조건 등 추가 문제 상황만 승인 후 적용합니다.'}
                </p>
                {a.mode === '교수자 직접' ? (
                  <div className="manual-fields">
                    <div className="field">
                      <label htmlFor="situation">상황</label>
                      <textarea
                        id="situation"
                        rows={3}
                        value={a.situation}
                        onChange={e => update('situation', e.target.value)}
                        placeholder="학생에게 제시할 상황을 작성하세요"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="timing">적용 시점</label>
                      <select id="timing" value={a.timing} onChange={e => update('timing', e.target.value)}>
                        {['과제 시작 시', '중간 점검 시', '산출물 제출 전', '교수자가 직접 적용'].map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field full">
                      <label htmlFor="manual-guidance">가이던스</label>
                      <textarea
                        id="manual-guidance"
                        rows={2}
                        value={a.manualGuidance}
                        onChange={e => update('manualGuidance', e.target.value)}
                        placeholder="학생의 탐색을 도울 안내를 작성하세요"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <fieldset className="ai-field">
                      <legend>개입 수준</legend>
                      <div className="intervention">
                        {['최소', '보통', '적극'].map((level, i) => (
                          <button
                            type="button"
                            key={level}
                            aria-pressed={a.intervention === level}
                            className={a.intervention === level ? 'selected' : ''}
                            onClick={() => update('intervention', level)}
                          >
                            <span>
                              {level}
                              {a.intervention === level && <Icon name="check" />}
                            </span>
                            <small>
                              {
                                [
                                  '도움을 요청하면 핵심 확인 질문으로 스스로 다음 행동을 찾도록 지원합니다.',
                                  '진행이 막히거나 검증이 필요하면 근거를 묻고 탐색·검증 방향을 안내합니다.',
                                  '수행 단계마다 판단 근거와 결과를 점검하고, 다른 조건에 적용해 보도록 질문합니다.',
                                ][i]
                              }
                            </small>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset className="ai-field">
                      <legend className="option-legend">
                        <span>허용 상황 유형</span>
                        <button
                          type="button"
                          className="auto-button"
                          onClick={() => {
                            const preferred = ['오류·장애', '자원 제한', '사용자 피드백'].filter(s =>
                              a.situationOptions.includes(s),
                            )
                            update('situations', preferred.length ? preferred : a.situationOptions.slice(0, 3))
                            onMessage('과제에 맞는 허용 상황 유형을 자동 설정했습니다.')
                          }}
                        >
                          <Icon name="settings" />
                          자동 설정
                        </button>
                      </legend>
                      <OptionEditor
                        label="상황 유형"
                        options={a.situationOptions}
                        selected={a.situations}
                        onToggle={s =>
                          update('situations', a.situations.includes(s) ? a.situations.filter(x => x !== s) : [...a.situations, s])
                        }
                        onAdd={s => {
                          update('situationOptions', [...a.situationOptions, s])
                          update('situations', [...a.situations, s])
                        }}
                        onRemove={s => {
                          update('situationOptions', a.situationOptions.filter(x => x !== s))
                          update('situations', a.situations.filter(x => x !== s))
                        }}
                      />
                    </fieldset>
                    {a.mode === '교수자 승인형' && (
                      <div className="approval-flow">
                        <span>AI 추가 문제 상황 제안</span>
                        <Icon name="right" />
                        <strong>교수자 검토·승인</strong>
                        <Icon name="right" />
                        <span>학생에게 적용</span>
                      </div>
                    )}
                  </>
                )}
                <fieldset className="guidance-field">
                  <legend className="option-legend">
                    <span>
                      가이던스 수준 <small>복수 선택</small>
                    </span>
                    <button
                      type="button"
                      className="auto-button"
                      onClick={() => {
                        const count = a.intervention === '최소' ? 1 : a.intervention === '보통' ? 3 : 5
                        update('guidance', { ...a.guidance, [a.mode]: a.guidanceOptions.slice(0, count) })
                        onMessage(`${a.intervention} 개입 수준에 맞춰 가이던스를 자동 설정했습니다.`)
                      }}
                    >
                      <Icon name="settings" />
                      자동 설정
                    </button>
                  </legend>
                  <OptionEditor
                    label="가이던스"
                    options={a.guidanceOptions}
                    selected={a.guidance[a.mode]}
                    onToggle={toggleGuidance}
                    onAdd={g => {
                      update('guidanceOptions', [...a.guidanceOptions, g])
                      update('guidance', { ...a.guidance, [a.mode]: [...a.guidance[a.mode], g] })
                    }}
                    onRemove={g => {
                      update('guidanceOptions', a.guidanceOptions.filter(x => x !== g))
                      update(
                        'guidance',
                        Object.fromEntries(modes.map(m => [m, a.guidance[m].filter(x => x !== g)])) as AssignmentType['guidance'],
                      )
                    }}
                  />
                </fieldset>
              </div>
            </section>
            <div className="evidence-note">
              <span className="evidence-icon">
                <Icon name="list" />
              </span>
              <div>
                <strong>과정은 자동으로, Learning Evidence</strong>
                <p>수행 기록 · 수정 과정 · 검증 결과 · AI 활용 과정을 시스템이 자동으로 구조화합니다.</p>
              </div>
              <span className="auto-badge">자동 기록</span>
            </div>
          </div>
        )}

        <div className="form-footer">
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          {created && (
            <p role="status" className="success-message">
              <Icon name="check" />「{a.title}」 과제 생성 완료 · 데모 저장
            </p>
          )}
          <div className="footer-inner">
            <div className="save-state">
              <span className={saved ? 'saved-dot' : 'unsaved-dot'} />
              {saved ? '이 브라우저에 저장됨' : '변경사항을 저장해 주세요'}
              <span className="demo-label">DEMO</span>
            </div>
            <div className="footer-actions">
              {step > 1 && (
                <button type="button" className="button secondary" onClick={() => changeStep(step - 1)}>
                  <Icon name="left" />
                  이전
                </button>
              )}
              <button type="button" className="button secondary" onClick={() => save()}>
                <Icon name="save" />
                임시 저장
              </button>
              <button type="submit" className="button primary">
                {step === 1 ? 'AI 운영 방식 설정' : step === 2 ? '학생 화면 미리보기' : created ? '과제 다시 저장' : '과제 생성'}
                <Icon name={step < 3 ? 'right' : 'check'} />
              </button>
            </div>
          </div>
        </div>
      </form>

      <dialog ref={dialog} className="goals-dialog">
        <div className="dialog-heading">
          <h2>과목 설정에서 목표 불러오기</h2>
          <Remove label="목표 불러오기 닫기" onClick={() => dialog.current?.close()} />
        </div>
        <p className="dialog-context">
          {course.name} <span>· 저장된 학습 목표와 예시 추천</span>
        </p>
        <div className="suggestion-summary">
          <strong>{a.title}</strong>
          <p>과제명과 연관된 학습 목표를 골라보세요.</p>
        </div>
        {loading ? (
          <div className="loading-suggestions" role="status">
            과목 커리큘럼에서 관련 목표를 정리하고 있어요…
          </div>
        ) : (
          <div className="suggestion-list">
            {suggestions.map(s => (
              <label key={s}>
                <input
                  type="checkbox"
                  checked={selectedGoals.includes(s)}
                  onChange={() =>
                    setSelectedGoals(selectedGoals.includes(s) ? selectedGoals.filter(x => x !== s) : [...selectedGoals, s])
                  }
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        )}
        <p className="micro-note">데모에서는 과제명에 맞춘 예시 추천을 제공합니다.</p>
        <div className="dialog-footer">
          <button className="button secondary" onClick={() => dialog.current?.close()}>
            취소
          </button>
          <button
            className="button primary"
            disabled={!selectedGoals.length || loading}
            onClick={() => {
              update('goals', [...new Set([...a.goals, ...selectedGoals])])
              dialog.current?.close()
              onMessage('선택한 목표를 추가했습니다.')
            }}
          >
            {selectedGoals.length}개 목표 가져오기
          </button>
        </div>
      </dialog>
    </>
  )
}
