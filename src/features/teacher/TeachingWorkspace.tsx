import { UsersRound, Activity } from 'lucide-react'
import {SectionTitle} from '@/components/layout/SectionTitle'
import {TeacherSupportQueue,SituationPanel,AlternativeReview} from '@/components/layout/LearningCycle'
import { useWorkspace } from '@/components/layout/WorkspaceContext'
import { scenarioEvidence, workspaceKey } from '@/domain/scenarios'
import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { type Assignment, demoStudents } from '@/domain/assignment'
import '@/styles/teaching.css'
import type { TeachingTarget } from '@/domain/course'
import { EvidenceReview } from './EvidenceReview'
import { snapshotMinutes, formatTime } from '@/domain/evidence'
import { MonitoringMap, StageDistribution } from './MonitoringMap'
import { ProgressRing } from './TeachingCharts'

export type TeachingView = 'monitoring' | 'evaluation'
type Status = '정상' | '확인 필요' | '지연' | '승인 대기'
const members = (id: number) => demoStudents.filter((_, i) => i % 6 === id - 1)
const teamOf = (student: string) => demoStudents.indexOf(student) % 6 + 1
const tone = (status: string) => status === '정상' || status === '충분' ? 'mint' : status === '승인 대기' || status === '진행 중' ? 'lavender' : status === '지연' || status === '부족' ? 'rose' : 'yellow'
function Badge({ value }: { value: string }) { return <span className={`teach-badge ${tone(value)}`}>{value}</span> }
type Review = { judgments: Record<string, string>; feedback: string }
function loadReviews(key:string): Record<string, Review> { try { return JSON.parse(localStorage.getItem(key) || '{}') || {} } catch { return {} } }

export function TeachingWorkspace({ view, assignment, onNavigate, initialTarget = {}, decisions, onDecisions: setDecisions }: { view: TeachingView; assignment: Assignment; onNavigate: (view: TeachingView) => void; initialTarget?:TeachingTarget; decisions:Record<string,string>; onDecisions:Dispatch<SetStateAction<Record<string,string>>> }) {
  const {scenario:s,data,setData}=useWorkspace()
  const teams=s.teams.map(t=>t.id===1?{...t,progress:Math.round(data.completed.length/s.tasks.length*100),stage:data.experiment?'결과 검증':'실행·수정',summary:data.experiment?'검증 조건과 결과가 공유되었습니다. 실제 적용 범위와 학생의 설명을 확인해 주세요.':s.need,reasons:data.experiment?['조건별 모의 검증 결과 기록','실제 환경의 검증 범위 확인 필요']:['수행 계획과 선택 근거 기록','검증 결과 추가 확인 필요']}:t), roles=s.roles
  const roleOf=(name:string)=>name==='유송민'?s.studentRole:teamOf(name)===1?roles[{'김민준':1,'윤서준':2,'장시우':3}[name]??0]:roles[Math.floor(demoStudents.indexOf(name)/6)]
  const [task, setTask] = useState(initialTarget.task || 'current')
  const [teamId, setTeamId] = useState(initialTarget.team || 2)
  const [student, setStudent] = useState(initialTarget.student || '이서연')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('전체')
  const [approvedSituations, setApprovedSituations] = useState<Record<string, string>>({})
  const [reviews, setReviews] = useState(()=>loadReviews(workspaceKey(s.id,'trace-reviews')))
  const [notice, setNotice] = useState('')
  const [dialogType, setDialogType] = useState<'approval' | 'guidance' | 'detail'>('detail')
  const [draft, setDraft] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const title = task === 'current' ? assignment.title : s.secondaryTitle
  const approvalMode = task === 'current' ? assignment.mode === '교수자 승인형' : false
  const displayedTeams = teams.map(t => ({ ...t, status: (t.id===1&&task==='current'&&data.situation?.status==='pending'?'승인 대기':t.status === '승인 대기' && (!approvalMode || decisions[`${task}-${t.id}`]) ? '정상' : t.status) as Status, progress: task === 'current' ? t.progress : Math.max(20, t.progress - 12), stage: task === 'current' ? t.stage : t.id === 4 ? '원인·요구 분석' : [2,6].includes(t.id) ? '실행·수정' : '결과 검증' }))
  const selected = { ...displayedTeams.find(t => t.id === teamId)! }
  if (teamId === 3 && (!approvalMode || decisions[`${task}-${teamId}`])) selected.summary = '제안 검토 상태가 반영되었습니다. 기록된 조건을 넘어 추가로 검증한 결과와 학생의 설명을 확인해 주세요.'
  const activityMinutes = parseInt(selected.recent)
  const teamEvidence = scenarioEvidence(s,members(teamId)[0], roles[0], teamId, task === 'vlan').evidence
  const studentTeam = displayedTeams.find(t => t.id === teamOf(student))!
  const reviewKey = `${task}-${student}`
  const review = reviews[reviewKey] || { judgments: {}, feedback: '' }
  const criterionList = task === 'current' ? assignment.criteria : [{ name: '문제 이해', weight: 20 }, { name: '해결 과정', weight: 30 }, { name: '검증', weight: 30 }, { name: '협업', weight: 20 }]
  const studentRole = roleOf(student)
  const matchedStudents = demoStudents.filter(name => `${name} ${teamOf(name)}팀`.includes(query.trim()))
  const averageProgress = Math.round(displayedTeams.reduce((sum,t) => sum + t.progress,0) / displayedTeams.length)
  function openDialog(kind: typeof dialogType) { setDialogType(kind); setDraft(kind === 'approval' ? s.approvalSituation : s.guidance); dialog.current?.showModal() }
  function decide(value: string) { setDecisions(prev => ({ ...prev, [`${task}-${teamId}`]: value })); if (value === '수정 후 승인') setApprovedSituations(prev => ({ ...prev, [`${task}-${teamId}`]: draft })); setNotice(`${teamId}팀의 AI 제안을 ${value}했습니다.`) }
  function updateReview(next: Partial<Review>) { setReviews(prev => ({ ...prev, [reviewKey]: { ...review, ...next } })); setNotice('') }
  function saveReview() { try { localStorage.setItem(workspaceKey(s.id,'trace-reviews'), JSON.stringify(reviews)); if(student==='유송민')setData(prev=>({...prev,reviews:{...prev.reviews,[student]:review}})); setNotice(`${student} 학생의 평가와 피드백을 이 브라우저에 저장했습니다.`) } catch { setNotice('저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.') } }
  function showStudent(name: string) { setStudent(name); setQuery(''); onNavigate('evaluation'); window.scrollTo(0, 0) }
  return <div className="teaching-workspace">
    <div className="teaching-toolbar"><div className="task-selector"><label htmlFor="teaching-task">진행 중인 과제</label><select id="teaching-task" value={task} onChange={e => { setTask(e.target.value); setNotice('') }}><option value="current">{assignment.title}</option><option value="vlan">{s.secondaryTitle}</option></select></div>{view === 'evaluation' ? <div className="student-picker"><div className="student-search"><label htmlFor="student-search">학생 검색</label><input id="student-search" type="search" placeholder="이름 또는 팀 검색" value={query} onChange={e => setQuery(e.target.value)} /></div><div className="student-dropdown"><label htmlFor="student-select">학생 선택 <span aria-live="polite">{matchedStudents.length}명</span></label><select id="student-select" value={matchedStudents.includes(student) ? student : ''} onChange={e => { setStudent(e.target.value); setNotice('') }}><option value="" disabled>{matchedStudents.length ? '학생을 선택하세요' : '검색 결과가 없습니다'}</option>{matchedStudents.map(name => <option key={name} value={name}>{name} · {teamOf(name)}팀 · {roleOf(name)}</option>)}</select></div></div> : <span className="snapshot-label">수업 현황 · {formatTime(snapshotMinutes)} 기준</span>}</div>
    <p className="teaching-demo">시연용 학생·수행 기록 · AI 요약은 교수자의 확인을 위한 참고 정보입니다.</p>
    {notice && <div role="status" className="teaching-notice">{notice}<button type="button" aria-label="처리 알림 닫기" onClick={() => setNotice('')}>닫기</button></div>}
    {view === 'monitoring' ? <>
      <section className="panel individual-observation-panel" aria-label="학생별 진행 상태와 개입 신호">
        <div className="section-heading">
          <SectionTitle icon={Activity} tone="mint">학생별 진행 상태와 개입 신호 (1인 실습 관찰)</SectionTitle>
          <span className="count-label">대표 관찰 대상 4명 · 전체 24명</span>
        </div>
        <div className="table-scroll">
          <table className="reference-table">
            <thead>
              <tr>
                <th>학생</th>
                <th>현재 상태</th>
                <th>AI 지원</th>
                <th>교수자 판단</th>
                <th>이동</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">학생 A · 유송민</th>
                <td>{data.experiment ? '검증 완료' : '진단·수정 진행'}</td>
                <td>확인 질문 {Math.max(1, data.student.privateMessages.filter(m => m.author === 'AI').length)}회</td>
                <td><Badge value="정상" /> 정상 진행</td>
                <td><button type="button" className="text-button" onClick={() => showStudent('유송민')}>학습 증거 확인 →</button></td>
              </tr>
              <tr>
                <th scope="row">학생 B · 김민준</th>
                <td>원인 탐색 중</td>
                <td>탐색 범위 안내</td>
                <td><Badge value="진행 중" /> 관찰 유지</td>
                <td><button type="button" className="text-button" onClick={() => showStudent('김민준')}>학습 증거 확인 →</button></td>
              </tr>
              <tr>
                <th scope="row">학생 C · 윤서준</th>
                <td>설정 수정 중</td>
                <td>AI 힌트 이용 후 수행</td>
                <td><Badge value="확인 필요" /> 설명 확인 필요</td>
                <td><button type="button" className="text-button" onClick={() => showStudent('윤서준')}>학습 증거 확인 →</button></td>
              </tr>
              <tr>
                <th scope="row">학생 D · 이서연</th>
                <td>수정 후 검증 누락</td>
                <td>반복 질문</td>
                <td><Badge value="지연" /> 교수자 개입 권장</td>
                <td><button type="button" className="text-button" onClick={() => showStudent('이서연')}>학습 증거 확인 →</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <div className="monitor-metrics">{[['전체 팀', displayedTeams.length, 'mint'], ['정상 진행', displayedTeams.filter(t => t.status === '정상').length, 'mint'], ['확인 필요', displayedTeams.filter(t => ['확인 필요','지연'].includes(t.status)).length, 'yellow'], ['승인 대기', displayedTeams.filter(t => t.status === '승인 대기').length, 'lavender']].map(([label, count, color]) => <div className="panel metric" key={label}><span>{label}</span><strong>{count}<small>팀</small></strong><span className={`metric-swatch ${color}`} aria-hidden="true">{label === '전체 팀' ? <span className="icon icon-users" /> : label === '정상 진행' ? <span className="icon icon-check" /> : label === '확인 필요' ? '?' : <span className="icon icon-list" />}</span><div className="metric-segments" aria-hidden="true">{displayedTeams.map((t,i)=><i key={t.id} className={i < Number(count) ? String(color) : ''} />)}</div></div>)}</div>
      <div className="monitor-layout"><section className="panel team-list-panel"><div className="section-heading"><SectionTitle icon={Activity}>팀 진행 현황</SectionTitle><span className="average-progress"><ProgressRing value={averageProgress} label="평균 팀 진행률" /><span>평균 진행률</span></span></div><div className="monitor-filters" aria-label="팀 상태 필터">{['전체','확인 필요','지연','승인 대기'].map(value => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div><MonitoringMap teams={displayedTeams.filter(t => filter === '전체' || t.status === filter)} selected={teamId} onSelect={setTeamId} /><StageDistribution teams={displayedTeams} />{!displayedTeams.some(t => filter === '전체' || t.status === filter) && <p className="teaching-empty">해당 상태의 팀이 없습니다.</p>}<div className="monitor-list-note"><strong>지금 살펴볼 팀</strong><p>2팀의 검증 결과 미수집과 4팀의 진단 이후 활동 지연을 확인해 주세요. 상태 표시는 평가 점수가 아닙니다.</p></div></section>
      <section className="panel team-detail" aria-label="선택 팀 상세"><div className="section-heading"><SectionTitle icon={UsersRound}>{teamId}팀</SectionTitle><Badge value={selected.status} /></div><div className="team-progress-overview"><ProgressRing value={selected.progress} label="선택 팀 진행률" tone={tone(selected.status)} /><div><strong>{selected.stage}</strong><p>과제 진행률</p><small>최근 활동 {selected.recent}</small></div></div>
        <section className="detail-section"><h3>확인이 필요한 이유</h3><p>{selected.summary}</p><ul className="reason-list">{selected.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></section>
        {approvalMode && teamId === 3 && <section className="approval-request"><div className="section-heading"><h3>추가 문제 상황 승인 요청</h3><Badge value={decisions[`${task}-${teamId}`] || '승인 대기'} /></div><p><strong>상황</strong> {approvedSituations[`${task}-${teamId}`] || s.approvalSituation}</p><p><strong>이유</strong> {s.approvalReason}</p><p><strong>원래 수행 범위</strong> {assignment.requirements.join(' · ')}</p><p><strong>추가로 남길 학습 증거</strong> 변경 전후 원자료, 예외 조건의 결과 비교, 선택 이유와 적용 범위 설명</p><details><summary>승인 판단에 참고할 수행 원자료</summary><pre>{teamEvidence.find(e=>e.stage===3)?.raw||teamEvidence[0]?.raw}</pre><p>기존 결과를 근거로 수행 범위를 추가하는 제안입니다. 일반 가이던스는 승인 대상에 포함되지 않습니다.</p></details>{!decisions[`${task}-${teamId}`] && <div className="compact-actions"><button className="button primary" onClick={() => decide('승인')}>승인</button><button className="button secondary" onClick={() => openDialog('approval')}>수정 후 승인</button><button className="text-button" onClick={() => decide('거절')}>거절</button></div>}</section>}
        {approvedSituations[`${task}-${teamId}`] && <p className="evidence-caption"><strong>승인한 수정 상황</strong><br />{approvedSituations[`${task}-${teamId}`]}</p>}
        <section className="detail-section"><h3>수행 범위와 도구</h3><strong>{teamId===1?data.plan.name:selected.name}</strong><p>{teamId===1?data.plan.scope:selected.stage}</p><small>{teamId===1?[data.plan.language,data.plan.frontend,data.plan.backend,data.plan.tools].join(' · '):selected.tools}</small></section>
        {teamId===1&&task==='current'&&<><TeacherSupportQueue/><SituationPanel teacher/><AlternativeReview/></>}
        <section className="detail-section"><h3>학생의 지도 요청</h3><p>{teamId===1?data.request||'아직 남긴 요청이 없습니다.':'아직 남긴 요청이 없습니다.'}</p><small>필요한 개념과 다음 수행을 함께 확인합니다.</small></section>
        <section className="detail-section"><h3>팀원 역할 현황</h3><div className="member-rows">{members(teamId).map(name => <div key={name}><button className="text-button" onClick={() => showStudent(name)}>{name}</button><span>{roleOf(name)}</span><small>{activityMinutes}분 전</small></div>)}</div></section>
        <section className="detail-section"><h3>주요 이벤트</h3><ol className="event-timeline">{[...teamEvidence.map(e => [e.time,e.title]),[formatTime(snapshotMinutes),'시스템 · 수행 기록 현황 확인']].map(([time,event]) => <li key={time}><time>{time}</time><span>{event}</span></li>)}</ol></section>
        <div className="detail-actions"><button className="button secondary" onClick={() => openDialog('detail')}>팀 상세 보기</button><button className="button primary" onClick={() => openDialog('guidance')}>가이던스 제안</button></div>
      </section></div>
    </> : <div className="evaluation-layout">
      <div className="student-review"><EvidenceReview key={reviewKey} name={student} role={studentRole} team={studentTeam.id} progress={studentTeam.progress} task={task} title={title} criteria={criterionList} review={review} onReview={updateReview} onSave={saveReview} onTeam={() => { setTeamId(studentTeam.id); onNavigate('monitoring'); window.scrollTo(0,0) }} />
      </div></div>}
    <dialog ref={dialog} className="teaching-dialog"><div className="section-heading"><h2>{teamId}팀 · {dialogType === 'detail' ? '수행 상세' : dialogType === 'approval' ? '제안 수정 후 승인' : '가이던스 제안'}</h2><button className="text-button" onClick={() => dialog.current?.close()}>닫기</button></div>{dialogType === 'detail' ? <><p>{selected.summary}</p><h3>현재 공유 문서</h3><p>{assignment.outputs.map(o=>o.name).join(" · ")}</p><h3>팀원별 수행 근거</h3><div className="member-rows">{members(teamId).map(name => <div key={name}><span>{name} · {roleOf(name)}</span><button className="text-button" onClick={() => { dialog.current?.close(); showStudent(name) }}>평가 근거 보기</button></div>)}</div></> : <><label htmlFor="guidance-draft">{dialogType === 'approval' ? '학생에게 적용할 상황' : '학생의 사고를 이끌 질문'}</label><textarea id="guidance-draft" rows={5} value={draft} onChange={e => setDraft(e.target.value)} /><p className="micro-note">시연에서는 제안과 처리 상태만 기록됩니다.</p><button className="button primary" disabled={!draft.trim()} onClick={() => { if (dialogType === 'approval') decide('수정 후 승인'); else { if(teamId===1)setData(prev=>({...prev,teacherFeedback:draft,feedbackSent:true})); setNotice(`${teamId}팀 가이던스 제안을 저장했습니다: ${draft}`); } dialog.current?.close() }}>{dialogType === 'approval' ? '수정 내용 승인' : '제안 저장'}</button></>}</dialog>
  </div>
}
