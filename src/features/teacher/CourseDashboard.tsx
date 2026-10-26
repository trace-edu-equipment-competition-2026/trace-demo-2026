import { useState } from 'react'
import { ChartColumn, TrendingUp, MessageCircle, Target, CircleHelp, Clock3, BookOpen, ArrowRight } from 'lucide-react'
import { scenarioEvidence } from '@/domain/scenarios'
import { summarizeObservation } from '@/domain/observations'
import { SectionTitle } from '@/components/layout/SectionTitle'
import { useWorkspace } from '@/components/layout/WorkspaceContext'
import type { Assignment } from '@/domain/assignment'
import { demoStudents, guidanceOptions } from '@/domain/assignment'
import { ProgressRing } from './TeachingCharts'
import { dashboardProjects, demoLessonOverview, type Course, type TeachingTarget } from '@/domain/course'
import type { TeachingView } from './TeachingWorkspace'

export function CourseDashboard({
  course,
  assignment,
  decisions,
  onOpen,
  onDesignAssignment,
}: {
  course: Course
  assignment: Assignment
  decisions: Record<string, string>
  onOpen: (view: TeachingView, target: TeachingTarget) => void
  onDesignAssignment?: () => void
}) {
  const { scenario: s, data: workspaceData } = useWorkspace()
  const lesson = demoLessonOverview[s.id]
  const teachingTeams = s.teams

  const [project, setProject] = useState('all')
  const [period, setPeriod] = useState('semester')
  const [scope, setScope] = useState('전체')
  const [subject, setSubject] = useState('1')
  const [activeCompetence, setActiveCompetence] = useState(0)

  const projects = dashboardProjects(assignment.title).map((p, i) => ({
    ...p,
    short: i === 0 ? assignment.title : s.projectNames[i],
  }))
  const selected = projects.filter(p => project === 'all' || p.id === project)
  const weekly = Array.from({ length: 7 }, (_, i) =>
    Math.round(selected.reduce((n, p) => n + p.weekly[i], 0) / selected.length),
  )
  const support = guidanceOptions.map((_, i) => selected.reduce((n, p) => n + p.support[i], 0))
  const shownSupport = support.map((n, i) =>
    period === 'recent' ? selected.reduce((sum, p) => sum + Math.round(p.support[i] * 0.6), 0) : n,
  )
  const totalSupport = shownSupport.reduce((a, b) => a + b, 0)
  const average = weekly[6]
  const pending = project !== 'vlan' && assignment.mode === '교수자 승인형' && !decisions['current-3'] ? 1 : 0
  const livePending = project === 'vlan' ? 0 : workspaceData.situation?.status === 'pending' ? 1 : 0
  const weeks = period === 'recent' ? [3, 4, 5, 6] : [0, 1, 2, 3, 4, 5, 6]
  const targetTask = project === 'all' ? 'current' : project
  const competenceNames = course.competencies

  const entries = demoStudents.flatMap((name, index) => {
    const team = (index % 6) + 1
    if ((scope === '팀별' && team !== Number(subject)) || (scope === '학생별' && name !== subject)) return []
    const role =
      name === '유송민'
        ? s.studentRole
        : team === 1
          ? s.roles[({ 김민준: 1, 윤서준: 2, 장시우: 3 } as Record<string, number>)[name] ?? 0]
          : s.roles[Math.floor(index / 6)]
    return selected.map(p => ({
      name,
      task: p.id,
      taskTitle: p.short,
      records: scenarioEvidence(s, name, role, team, p.id === 'vlan', p.id === 'current' ? workspaceData : undefined).evidence,
    }))
  })

  const observations = competenceNames.map(label => summarizeObservation(label, entries))
  const observation = observations[activeCompetence] || observations[0]
  const points = (values: number[]) =>
    weeks.map((w, i) => `${45 + (i * 495) / (weeks.length - 1)},${190 - values[w] * 1.6}`).join(' ')

  return (
    <div className="course-dashboard">
      <section className="panel lesson-overview-panel" aria-label="담당 수업 및 이번 차시 현황">
        <div className="lesson-overview-head">
          <div>
            <div className="lesson-badges">
              <span className="teach-badge mint">{lesson.badge}</span>
              <span className="teach-badge lavender">{lesson.gradeLabel}</span>
            </div>
            <h2 className="lesson-main-title">{lesson.lessonTitle}</h2>
            <p className="lesson-context">{lesson.classContext}</p>
          </div>
          {onDesignAssignment && (
            <button type="button" className="button primary" onClick={onDesignAssignment}>
              <BookOpen size={17} />
              이번 차시 과제 설계
              <ArrowRight size={17} />
            </button>
          )}
        </div>
        <div className="lesson-metrics-grid">
          <div>
            <span>학습 진도</span>
            <strong>{lesson.progressWeek}</strong>
            <small>{lesson.progressDetail}</small>
          </div>
          <div>
            <span>이수 차시</span>
            <strong>{lesson.completedSessions}</strong>
            <small>가상 수업계획 편성 기준</small>
          </div>
          <div>
            <span>과제 방식</span>
            <strong>{lesson.taskMode}</strong>
            <small>교수자 설정에 따라 전환 가능</small>
          </div>
        </div>
        <div className="lesson-sequence-grid">
          <div className="lesson-goals-box">
            <div>
              <strong>선수학습</strong>
              <p>{lesson.prerequisite}</p>
            </div>
            <div>
              <strong>이번 목표</strong>
              <p>{lesson.objective}</p>
            </div>
          </div>
          <dl className="lesson-flow-table" aria-label="차시 연결 흐름">
            <div>
              <dt>이전 수업</dt>
              <dd>{lesson.previousLesson}</dd>
            </div>
            <div className="current-session-row">
              <dt>이번 수업</dt>
              <dd>{lesson.currentLesson}</dd>
            </div>
            <div>
              <dt>다음 수업</dt>
              <dd>{lesson.nextLesson}</dd>
            </div>
          </dl>
        </div>
        <p className="micro-note">
          {lesson.disclaimer} ({lesson.curriculumBasis})
        </p>
      </section>

      <div className="dashboard-top">
        <div>
          <h2>{course.name}</h2>
          <p>
            {lesson.semester} · {lesson.classGroup} · 학생 24명 (관찰 그룹 6개조)
          </p>
        </div>
        <div className="dashboard-filters">
          <label>
            프로젝트
            <select aria-label="프로젝트" value={project} onChange={e => setProject(e.target.value)}>
              <option value="all">전체 프로젝트</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.short}
                </option>
              ))}
            </select>
          </label>
          <label>
            기간
            <select aria-label="기간" value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="semester">학기 전체</option>
              <option value="recent">최근 4주</option>
            </select>
          </label>
        </div>
      </div>

      <p className="course-demo-note">
        가상 수업 데이터 · 현재 {lesson.progressWeek} ({lesson.completedSessions}차시) · 기간 필터는 추이와 AI 지원 통계에 적용됩니다.
      </p>

      <div className="dashboard-stats">
        {(
          [
            ['진행 중 과제', selected.length, '개', 'mint'],
            ['전체 학생', 24, '명', 'lavender'],
            ['확인 필요', 2, '그룹', 'yellow'],
            ['문제 상황 승인 대기', pending + livePending, '건', 'rose'],
          ] as const
        ).map(([label, value, unit, color]) => (
          <div className="panel dashboard-stat" key={label}>
            <span>{label}</span>
            <div>
              <strong>
                {value}
                <small>{unit}</small>
              </strong>
              <span className={`stat-square ${color}`}>
                <span className={`icon icon-${label === '전체 학생' ? 'users' : label === '진행 중 과제' ? 'edit' : 'list'}`} />
              </span>
            </div>
          </div>
        ))}
        <div className="panel dashboard-stat average-stat">
          <span>평균 과제 진행률</span>
          <ProgressRing value={average} label="전체 과제 평균 진행률" />
        </div>
      </div>

      <section className="panel dashboard-priority">
        <div className="section-heading">
          <SectionTitle icon={CircleHelp} tone="yellow">
            지금 확인할 항목
          </SectionTitle>
          <span className="count-label">{pending + livePending + 2}건</span>
        </div>
        <table className="reference-table intervention-table">
          <thead>
            <tr>
              <th>대상</th>
              <th>확인 이유</th>
              <th>이동</th>
            </tr>
          </thead>
          <tbody>
            {livePending > 0 && (
              <tr>
                <th>1팀</th>
                <td>추가 문제 상황 {livePending}건 승인 대기</td>
                <td>
                  <button className="text-button" onClick={() => onOpen('monitoring', { task: 'current', team: 1 })}>
                    추가 상황 검토 →
                  </button>
                </td>
              </tr>
            )}
            <tr>
              <th>2팀</th>
              <td>18분간 후속 수행 없음 · 검증 결과 미수집</td>
              <td>
                <button className="text-button" onClick={() => onOpen('monitoring', { task: targetTask, team: 2 })}>
                  팀 보기 →
                </button>
              </td>
            </tr>
            <tr>
              <th>이서연</th>
              <td>수정 이후 검증 근거 확인 필요</td>
              <td>
                <button className="text-button" onClick={() => onOpen('evaluation', { task: targetTask, student: '이서연' })}>
                  학생 보기 →
                </button>
              </td>
            </tr>
            {pending > 0 && (
              <tr>
                <th>3팀</th>
                <td>검증 범위를 넓히는 AI 상황 제안</td>
                <td>
                  <button className="text-button" onClick={() => onOpen('monitoring', { task: 'current', team: 3 })}>
                    승인 검토 →
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <SectionTitle icon={ChartColumn} tone="mint">
              과제별 진행 현황
            </SectionTitle>
            <span className="count-label">현재 누적</span>
          </div>
          <div className="project-progress-list">
            {selected.map(p => (
              <button key={p.id} onClick={() => onOpen('monitoring', { task: p.id, team: 2 })}>
                <span>
                  <strong>{p.short}</strong>
                  <b>{p.weekly[6]}%</b>
                </span>
                <span className="dashboard-bar">
                  <i className={`chart-fill-${projects.findIndex(item => item.id === p.id)}`} style={{ width: `${p.weekly[6]}%` }} />
                </span>
                <small>
                  진행 현황 상세 보기 <span className="icon icon-right" />
                </small>
              </button>
            ))}
          </div>
          <div className="chart-footnote">진행률은 현재 수행 단계의 요약입니다.</div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <SectionTitle icon={TrendingUp} tone="mint">
              주차별 학습 진행률
            </SectionTitle>
            <span className="count-label">8주차 진입 (1~7주 누적)</span>
          </div>
          <div className="chart-key">
            <span>
              <i className="chart-fill-0" />
              실제 진행
            </span>
            <span>
              <i className="chart-neutral" />
              계획 진행
            </span>
          </div>
          <svg
            className="semester-chart"
            viewBox="0 0 565 225"
            role="img"
            aria-label={`주차별 실제 진행률 ${weeks.map(w => `${w + 1}주차 ${weekly[w]}%`).join(', ')}, 계획 ${weeks.map(w => `${(w + 1) * 10}%`).join(', ')}`}
          >
            {[0, 25, 50, 75, 100].map(n => (
              <g key={n}>
                <line x1="45" x2="540" y1={190 - n * 1.6} y2={190 - n * 1.6} />
                <text x="32" y={194 - n * 1.6} textAnchor="end">
                  {n}
                </text>
              </g>
            ))}
            <polyline className="planned" points={points([10, 20, 30, 40, 50, 60, 70])} />
            <polyline className="actual" points={points(weekly)} />
            {weeks.map((w, i) => (
              <g key={w}>
                <circle cx={45 + (i * 495) / (weeks.length - 1)} cy={190 - weekly[w] * 1.6} r="4" />
                <text x={45 + (i * 495) / (weeks.length - 1)} y="215" textAnchor="middle">
                  {w + 1}주
                </text>
              </g>
            ))}
          </svg>
        </section>

        <section className="panel dashboard-ai">
          <div className="section-heading">
            <SectionTitle icon={MessageCircle} tone="lavender">
              과제별 AI 지원
            </SectionTitle>
            <span className="count-label">
              {period === 'recent' ? '최근 4주' : '학기 누적'} · {totalSupport}회
            </span>
          </div>
          <div className="ai-analysis">
            <div>
              {selected.map(p => {
                const counts = p.support.map(n => (period === 'recent' ? Math.round(n * 0.6) : n))
                return (
                  <div className="project-support" key={p.id}>
                    <h3>{p.short}</h3>
                    <div
                      className="support-stacked-bar"
                      role="img"
                      aria-label={counts.map((n, i) => `${guidanceOptions[i]} ${n}회`).join(', ')}
                    >
                      {counts.map((n, i) => (
                        <span key={i} className={`chart-fill-${i}`} style={{ flex: n }} title={`${guidanceOptions[i]} ${n}회`}>
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
              <p className="chart-footnote">지원 형태를 비교합니다. 사용량이 성과를 뜻하지는 않습니다.</p>
            </div>
            <div className="support-donut-wrap">
              <svg
                className="support-donut"
                viewBox="0 0 120 120"
                role="img"
                aria-label={`AI 지원 분포 ${shownSupport.map((n, i) => `${guidanceOptions[i]} ${Math.round((n / totalSupport) * 100)}%`).join(', ')}`}
              >
                {shownSupport.map((n, i) => {
                  const start = (shownSupport.slice(0, i).reduce((a, b) => a + b, 0) / totalSupport) * 100
                  return (
                    <circle
                      key={i}
                      className={`donut-segment donut-${i}`}
                      cx="60"
                      cy="60"
                      r="46"
                      pathLength="100"
                      strokeDasharray={`${(n / totalSupport) * 100} ${100 - (n / totalSupport) * 100}`}
                      strokeDashoffset={-start}
                      transform="rotate(-90 60 60)"
                    />
                  )
                })}
                <text x="60" y="58" textAnchor="middle">
                  {totalSupport}
                </text>
                <text className="donut-sub" x="60" y="76" textAnchor="middle">
                  지원 기록
                </text>
              </svg>
            </div>
          </div>
          <div className="support-legend">
            {guidanceOptions.map((g, i) => (
              <span key={g}>
                <i className={`chart-fill-${i}`} />
                {g}
                <b>{Math.round((shownSupport[i] / totalSupport) * 100)}%</b>
              </span>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <SectionTitle icon={Target} tone="mint">
              핵심 역량 관찰 현황
            </SectionTitle>
            <div className="compact-tabs">
              {(['전체', '팀별', '학생별'] as const).map(sTab => (
                <button
                  aria-pressed={scope === sTab}
                  key={sTab}
                  onClick={() => {
                    setScope(sTab)
                    setSubject(sTab === '학생별' ? demoStudents[0] : '1')
                  }}
                >
                  {sTab}
                </button>
              ))}
            </div>
          </div>
          {scope !== '전체' && (
            <select
              className="competency-subject"
              aria-label="역량 조회 대상"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            >
              {(scope === '팀별' ? teachingTeams.map(t => String(t.id)) : demoStudents).map(v => (
                <option key={v} value={v}>
                  {scope === '팀별' ? `${v}팀` : v}
                </option>
              ))}
            </select>
          )}
          <div className="competence-bars">
            {competenceNames.map((label, i) => (
              <button key={label} aria-pressed={activeCompetence === i} onClick={() => setActiveCompetence(i)}>
                <span>{label}</span>
                <span className="dashboard-bar">
                  <i className={`chart-fill-${i % 5}`} style={{ width: `${observations[i].rate ?? 0}%` }} />
                </span>
                <strong>{observations[i].rate === null ? '미집계' : `${observations[i].rate}%`}</strong>
              </button>
            ))}
          </div>
          <p className="chart-footnote">
            기준에 맞는 기록이 있는 학생·과제 비율입니다. 역량 점수가 아닙니다. 항목을 눌러 근거를 확인하세요.
          </p>
          {observation && (
            <details className="observation-details" key={`${scope}-${subject}-${project}-${activeCompetence}`}>
              <summary>
                집계 기준과 학생 근거{' '}
                <span>{observation.rate === null ? '기준 설정 필요' : `${observation.observed} / ${observation.total}건`}</span>
              </summary>
              <dl>
                <div>
                  <dt>확인 조건</dt>
                  <dd>{observation.condition || '이 역량의 관찰 조건을 먼저 설정해 주세요.'}</dd>
                </div>
                <div>
                  <dt>집계 대상</dt>
                  <dd>
                    {scope === '전체' ? '전체 학생' : scope === '팀별' ? `${subject}팀` : subject} · {selected.length}개 과제 · 현재 누적 시연 기록
                  </dd>
                </div>
                <div>
                  <dt>계산</dt>
                  <dd>
                    {observation.rate === null
                      ? '미집계'
                      : `${observation.observed}건 ÷ ${observation.total}건 × 100 = ${observation.rate}% (반올림)`}
                  </dd>
                </div>
                <div>
                  <dt>추가 확인</dt>
                  <dd>
                    {observation.rate === null
                      ? '관찰 기준 미설정'
                      : `${observation.missing}건은 조건에 맞는 기록이 없습니다. 미수행이나 능력 부족으로 단정하지 않습니다.`}
                  </dd>
                </div>
              </dl>
              <div className="observation-records">
                {observation.rows.map(row => (
                  <button
                    className="text-button"
                    key={`${row.name}-${row.task}`}
                    onClick={() => onOpen('evaluation', { student: row.name, task: row.task })}
                  >
                    <span>
                      <strong>{row.name}</strong>
                      <small>{row.taskTitle}</small>
                    </span>
                    <span>{row.evidence.length ? row.evidence.map(e => e.id).join(' · ') : '근거 미확인'} →</span>
                  </button>
                ))}
              </div>
            </details>
          )}
        </section>
      </div>

      <div className="dashboard-bottom">
        <section className="panel">
          <div className="section-heading">
            <SectionTitle icon={Clock3} tone="mint">
              최근 주요 활동
            </SectionTitle>
            <span className="count-label">현재 수업 ({lesson.progressWeek})</span>
          </div>
          <ol className="event-timeline dashboard-timeline">
            <li>
              <time>14:29</time>
              <span>유송민 · 수정 전후 검증 결과 정리</span>
            </li>
            {project !== 'vlan' && (
              <li>
                <time>14:28</time>
                <span>3팀 · {pending ? 'AI 상황 제안 승인 요청' : '검증 범위 확장 검토'}</span>
              </li>
            )}
            <li>
              <time>14:26</time>
              <span>1팀 · 실행·검증 결과 공유</span>
            </li>
            <li>
              <time>14:13</time>
              <span>이서연 · 다음 검증 계획 기록</span>
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}
