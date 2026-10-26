import { useWorkspace } from '@/components/layout/WorkspaceContext'
import { scenarioEvidence, workspaceKey } from '@/domain/scenarios'
import { useRef, useState } from 'react'
import { criterionEstimate, evidenceStages, guidanceLevels, evidenceKinds, evidenceKind, isPerformedEvidence } from '@/domain/evidence'
import type { Assignment } from '@/domain/assignment'
import { ClipboardCheck, Files, MessageCircle, Activity, CheckCircle2, CircleHelp, ArrowRight } from 'lucide-react'
import { SectionTitle } from '@/components/layout/SectionTitle'

type Review = { judgments: Record<string, string>; feedback: string }
type Check = { status: string; note: string }
function loadChecks(key:string): Record<string, Check> {
  try { return JSON.parse(localStorage.getItem(key) || '{}') || {} } catch { return {} }
}
export function EvidenceReview({ name, role, team, progress, task, title, criteria, review, onReview, onSave, onTeam }: {
  name: string; role: string; team: number; progress: number; task: string; title: string; criteria: Assignment['criteria'];
  review: Review; onReview: (next: Partial<Review>) => void; onSave: () => void; onTeam: () => void;
}) {
  const {scenario:s,data:project}=useWorkspace()
  const data = scenarioEvidence(s,name,role,team,task==='vlan',project)
  const [active, setActive] = useState('E02')
  const [criterionIndex, setCriterionIndex] = useState(1)
  const [detailView, setDetailView] = useState<'evidence'|'guidance'|'activity'>('evidence')
  const [stage, setStage] = useState<number | 'supplement' | null>(null)
  const [supportIndex, setSupportIndex] = useState(1)
  const [checks, setChecks] = useState(()=>loadChecks(workspaceKey(s.id,'trace-evidence-checks')))
  const [checkNotice, setCheckNotice] = useState('')
  const explorer = useRef<HTMLElement>(null)
  const filtered = data.evidence.filter(e => stage === null || (stage==='supplement' ? !isPerformedEvidence(e) : isPerformedEvidence(e)&&e.stage===stage))
  const evidence = filtered.find(e => e.id === active) || filtered[0]
  const support = data.guidance[Math.min(supportIndex, data.guidance.length - 1)]
  const checkKey = `${task}-${name}-${evidence?.id}`
  const check = checks[checkKey] || { status: '미확인', note: '' }
  const checkedCount = data.evidence.filter(e => checks[`${task}-${name}-${e.id}`]?.status === '확인 완료').length
  const stageCounts = evidenceStages.map((_, i) => data.evidence.filter(e => isPerformedEvidence(e)&&e.stage === i).length)
  const maxCriterionWeight = Math.max(1, ...criteria.map(c => Number.isFinite(c.weight) ? c.weight : 0))
  const levelCounts = guidanceLevels.map((_, i) => data.guidance.filter(g => g.level === i + 1).length)
  const observed = data.evidence.find(e=>isPerformedEvidence(e)&&e.stage===2) || data.evidence.find(e=>isPerformedEvidence(e)&&e.stage===1) || data.evidence[0]
  const resultEvidence = data.evidence.find(e=>e.id===support.evidence)
  const selectedCriterion = criteria[criterionIndex]
  const selectedEstimate = selectedCriterion && criterionEstimate(selectedCriterion.name, selectedCriterion.weight, data.evidence)
  function selectEvidence(id: string) {
    setActive(id); setCheckNotice('')
    if(!selectedEstimate?.ids.includes(id))setCriterionIndex(criteria.findIndex(c=>criterionEstimate(c.name,c.weight,data.evidence).ids.includes(id)))
  }
  function selectStage(next: number | 'supplement' | null) {
    setStage(next); setCheckNotice('')
    const records=data.evidence.filter(e=>next===null || (next==='supplement' ? !isPerformedEvidence(e) : isPerformedEvidence(e)&&e.stage===next))
    const nextEvidence=records.find(e=>e.id===active) || records[0]
    if(nextEvidence)selectEvidence(nextEvidence.id);else setCriterionIndex(-1)
  }
  function openEvidence(id: string) {
    if(!data.evidence.some(e=>e.id===id)&&/^E0[1-4]$/.test(id))id=[...data.evidence].reverse().find(e=>e.stage===Number(id.slice(-1))-1&&isPerformedEvidence(e))?.id || id
    setDetailView('evidence'); setStage(null); selectEvidence(id)
    requestAnimationFrame(() => { explorer.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); document.getElementById('evidence-detail-title')?.focus({ preventScroll: true }) })
  }
  function saveCheck() {
    try { localStorage.setItem(workspaceKey(s.id,'trace-evidence-checks'), JSON.stringify(checks)); setCheckNotice(`${evidence.id} 교수자 확인을 저장했습니다.`) }
    catch { setCheckNotice('저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.') }
  }
  return <>
    <section className="panel evidence-overview review-profile">
      <div className="review-person"><div className="student-identity"><span className="student-initial" aria-hidden="true">{name.slice(0,1)}</span><div><h2>{name}<span className="student-team-label">{team}팀</span></h2><p>{role}</p></div></div><button className="text-button" onClick={onTeam}>팀 보기 <ArrowRight size={16}/></button></div>
      <p className="review-assignment">{title}</p>
      <div className="review-profile-stats"><div><span>팀 과제 진행</span><strong>{progress}<small>%</small></strong><span className="dashboard-bar" role="img" aria-label={`${team}팀 과제 진행률 ${progress}%`}><i className="chart-fill-0" style={{width:`${progress}%`}}/></span></div><div><span>수집한 과정증거</span><strong>{data.evidence.length}<small>개</small></strong></div><div><span>교수자 확인</span><strong>{checkedCount}<small> / {data.evidence.length}개</small></strong></div><button className="button secondary" onClick={()=>openEvidence(data.evidence.find(e=>checks[`${task}-${name}-${e.id}`]?.status!=='확인 완료')?.id || 'E01')}>근거 검토하기 <ArrowRight size={16}/></button></div>
    </section>
    <div className="insight-pair">
      <section className="insight strength"><div className="insight-heading"><span className="insight-symbol" aria-hidden="true"><CheckCircle2 size={19}/></span><h3>근거에서 보이는 강점</h3></div><strong>{observed?.title || '아직 수행 기록이 없습니다'}</strong><p>{observed?.interpretation || '첫 수행과 판단 이유를 확인해 주세요.'}</p><button className="text-button" onClick={() => observed && openEvidence(observed.id)}>{observed?.id} · 수행 근거 보기 <span aria-hidden="true">↗</span></button></section>
      <section className="insight gap"><div className="insight-heading"><span className="insight-symbol" aria-hidden="true"><CircleHelp size={19}/></span><h3>다음에 확인할 부분</h3></div><strong>{!data.hasModification ? '어떤 근거로 수정안을 고를 것인가?' : data.incomplete ? '수정 이후 목표를 충족했는가?' : '다른 조건에서도 같은 판단을 할 수 있는가?'}</strong><p>{data.incomplete ? '실행 결과가 아직 수집되지 않았습니다. 수행 여부는 추가 확인이 필요합니다.' : '기록된 조건 밖에서도 적용할 수 있는지 추가로 확인해 주세요.'}</p><p><b>추천 질문</b> · {data.incomplete ? '어떤 조건에서 다시 실행했고, 결과가 어떻게 달라졌나요?' : '조건을 바꾸면 어떤 결과를 예상하나요? 그 이유는 무엇인가요?'}</p><button className="text-button" onClick={() => openEvidence(data.incomplete ? 'E05' : 'E04')}>{!data.hasModification ? 'E05 · 진단 계획 보기' : data.incomplete ? 'E05 · 검증 계획 보기' : 'E04 · 검증 범위 보기'} <span aria-hidden="true">↗</span></button></section>
    </div>
    <div className="assessment-workbench"><section id="teacher-review" className="panel instructor-evaluation"><div className="section-heading"><SectionTitle icon={ClipboardCheck} tone="mint">평가 요소별 충족 현황</SectionTitle><span className="teach-badge lavender">AI 추정 · 교수자 검토 전</span></div><p className="section-note">공통 눈금 0–{maxCriterionWeight}점 · 진한 막대는 현재 충족분, 끝 표시는 배점입니다. 근거를 대조한 뒤 교수자 판단을 기록하세요. AI 추정은 시연용입니다.</p><div className="evaluation-table-scroll"><table className="evaluation-table attainment-table"><thead><tr><th>평가 요소</th><th>AI 추정 충족분 <small>공통 눈금 0–{maxCriterionWeight}점</small></th><th>추정 이유 · 과정증거</th><th>교수자 판단</th></tr></thead><tbody>{criteria.map((criterion,i)=> {
      const estimate = criterionEstimate(criterion.name, criterion.weight, data.evidence)
      return <tr className={criterionIndex===i?"selected-criterion":""} key={`${criterion.name}-${i}`}><th scope="row"><button className="criterion-select" aria-pressed={criterionIndex===i} onClick={()=>{ if(estimate.ids[0])openEvidence(estimate.ids[0]); setCriterionIndex(i) }}><strong>{criterion.name}</strong></button><small>배점 {criterion.weight}점</small></th><td className="attainment-cell">{estimate.score === null ? <><strong className="unestimated">산정 대기</strong><span className="attainment-scale"><span className="attainment-track pending" style={{width:`${criterion.weight/maxCriterionWeight*100}%`}} /></span><small>근거 추가 확인</small></> : <><div className="attainment-value"><strong>{estimate.score}<small> / {criterion.weight}점</small></strong></div><div className="attainment-scale" role="img" aria-label={`${criterion.name} 배점 ${criterion.weight}점 중 AI 추정 ${estimate.score}점`}><span className="attainment-track" style={{width:`${criterion.weight/maxCriterionWeight*100}%`}} /><span className={`attainment-fill chart-fill-${i%5}`} style={{width:`${estimate.score/maxCriterionWeight*100}%`}} /><span className="attainment-cap" style={{left:`${criterion.weight/maxCriterionWeight*100}%`}} /></div></>}</td><td><p className="estimate-reason">{estimate.reason}</p><div className="estimate-links">{estimate.ids.map(id=><button key={id} className="text-button" onClick={()=>openEvidence(id)}>{id} 근거 보기<span className="icon icon-right" aria-hidden="true" /></button>)}</div></td><td><select aria-label={`${criterion.name} 교수자 판단`} value={review.judgments[criterion.name]||''} onChange={e=>onReview({judgments:{...review.judgments,[criterion.name]:e.target.value}})}><option value="">판단 선택</option>{['우수','충분','적절','보완 필요','판단 보류'].map(v=><option key={v}>{v}</option>)}</select></td></tr>
    })}</tbody></table></div></section>
    <div className="assessment-detail"><div className="criterion-context"><span>{selectedCriterion?'선택한 평가 요소':'과정증거 검토'}</span><strong>{selectedCriterion?.name || '연결된 평가 요소 없음'}</strong><p>{selectedEstimate?.reason || '수집된 자료를 확인하고 평가 요소와의 연결을 검토하세요.'}</p>{selectedEstimate&&<details className="estimate-explanation"><summary>충족 근거와 남은 조건</summary><dl><div><dt>연결된 근거</dt><dd>{selectedEstimate.ids.length?selectedEstimate.ids.map(id=>{const record=data.evidence.find(e=>e.id===id)!;return <button className="text-button" key={id} onClick={()=>openEvidence(id)}>{id} · {record.title} <small>{evidenceKinds[evidenceKind(record)]}</small></button>}):'연결된 자료가 없습니다.'}</dd></div><div><dt>남은 확인</dt><dd>{selectedEstimate.remaining}</dd></div><div><dt>추정 방식</dt><dd>{selectedEstimate.score===null?'근거가 충분하지 않아 점수 산정을 보류합니다.':`배점 ${selectedCriterion.weight}점 중 ${selectedEstimate.score}점의 시연용 추정입니다. 항목별 충족 판단 예시이며 AI가 실제 채점한 결과는 아닙니다.`}</dd></div></dl></details>}</div><div className="review-workspace-tabs" role="group" aria-label="평가 상세 보기">
      <button aria-pressed={detailView==='evidence'} onClick={()=>setDetailView('evidence')}><Files size={18}/>과정증거 <span>{data.evidence.length}</span></button>
      <button aria-pressed={detailView==='guidance'} onClick={()=>setDetailView('guidance')}><MessageCircle size={18}/>가이던스 이력 <span>{data.guidance.length}</span></button>
      <button aria-pressed={detailView==='activity'} onClick={()=>setDetailView('activity')}><Activity size={18}/>개념 이해와 수행</button>
    </div>
    <section className="panel competency-panel" hidden={detailView!=='activity'}><div className="section-heading"><SectionTitle icon={Activity} tone="mint">학습 상태와 수행 근거</SectionTitle><span className="count-label">AI 정리 · 확인 전</span></div>
      <div className="reference-tables"><section><h3>교과 개념별 확인 포인트</h3><table className="reference-table"><thead><tr><th>교과 개념</th><th>확인 상태</th><th>근거</th></tr></thead><tbody>{[[s.concepts[0],'E01','관찰로 범위 구분'],[s.concepts[1],'E02','비교 근거 있음'],['검증 조건과 결과 해석',data.incomplete?'E05':'E04',data.incomplete?'실행 결과 미수집':'검증 범위 추가 확인']].map(([concept,id,state],i)=><tr key={concept}><th scope="row">{concept}</th><td className={i===2?'reference-caution':'reference-positive'}>{state}</td><td><button className="text-button" onClick={()=>openEvidence(id)}>{id}<span className="icon icon-right" aria-hidden="true" /></button></td></tr>)}</tbody></table></section>
      <section><div className="reference-table-heading"><h3>역할에 따른 실제 행동</h3><span>{role}</span></div><table className="reference-table"><thead><tr><th>수행 기록</th><th>자료 구분</th><th>시각</th></tr></thead><tbody>{data.evidence.slice(0,3).map(e=><tr key={e.id}><th scope="row"><button className="text-button" onClick={()=>openEvidence(e.id)}>{e.title}</button></th><td>{e.shared?'팀 자료 해석':'학생 기록'}</td><td><time>{e.time}</time></td></tr>)}</tbody></table></section></div>
    </section>
    <section ref={explorer} className="panel evidence-explorer" id="learning-evidence" hidden={detailView!=='evidence'}><div className="section-heading"><SectionTitle icon={Files} tone="mint">Learning Evidence</SectionTitle><span className="count-label">원자료와 해석을 함께 검토</span></div>
      <div className="monitor-filters" aria-label="증거 단계 필터"><button aria-pressed={stage===null} onClick={() => selectStage(null)}>전체 {data.evidence.length}</button>{evidenceStages.map((label,i) => <button key={label} aria-pressed={stage===i} onClick={() => selectStage(i)}>{label} {stageCounts[i]}</button>)}<button aria-pressed={stage==='supplement'} onClick={()=>selectStage('supplement')}>계획·자기 설명 {data.evidence.filter(e=>!isPerformedEvidence(e)).length}</button></div><p className="evidence-caption">단계별 건수는 수행 기록만 집계합니다. 계획·자기 설명은 별도로 검토합니다.</p>
      <div className="evidence-browser"><div className="evidence-list" aria-label="학습 증거 목록">{filtered.map(e => <button key={e.id} aria-pressed={evidence?.id===e.id} onClick={() => selectEvidence(e.id)}><span><b>{e.id}</b><time>{e.time}</time></span><strong>{e.title}</strong><small>{e.source}</small><span className="evidence-kind">{evidenceKinds[evidenceKind(e)]}</span><span className={`evidence-review-state ${checks[`${task}-${name}-${e.id}`]?.status === '확인 완료' ? 'mint' : ''}`}>{checks[`${task}-${name}-${e.id}`]?.status || '미확인'}</span></button>)}{!filtered.length && <div className="missing-evidence"><strong>{stage==='supplement'?'계획·자기 설명이 아직 없습니다':stage===2 ? '수정 기록이 아직 없습니다' : '검증 결과가 아직 없습니다'}</strong><p>{data.hasModification ? '변경 수행은 확인되지만 실행 결과는 미수집 상태입니다.' : '진단 계획 이후 수정·검증 자료가 아직 없습니다.'}</p><button className="text-button" onClick={() => openEvidence('E05')}>{data.hasModification ? '학생의 다음 검증 계획 보기' : '학생의 다음 진단 계획 보기'}</button></div>}</div>
        {evidence && <article className="evidence-detail"><div className="evidence-group-student"><div className="section-heading"><h3 id="evidence-detail-title" tabIndex={-1}>{evidence.id} · {evidence.title}</h3><span className="count-label">{evidenceStages[evidence.stage]} · {evidenceKinds[evidenceKind(evidence)]}</span></div><p className="evidence-goal">학습 목표 · {evidence.goal}</p>
          <section className="source-layer"><div className="layer-heading"><strong><Files size={16}/> 1. 실제 실행 기록 · 원자료</strong><small>{evidence.shared ? `${team}팀 공유 자료` : name} · {evidence.time} · 명령어·설정 변경·전후 통신 결과</small></div><pre>{evidence.raw}</pre><small>{evidence.source} · 시연용 기록</small></section>
          <section className="student-layer"><div className="layer-heading"><strong><MessageCircle size={16}/> 2. 학생의 판단 기록 · 학생 설명</strong><small>{name} 작성 · 원인 가설과 수정 이유 설명</small></div><p>{evidence.explanation}</p></section></div>
          <div className="evidence-group-teacher"><section className="interpretation-layer"><div className="layer-heading"><strong><Activity size={16}/> 3. AI 지원 정보 및 해석</strong><span className={`teach-badge ${check.status==='확인 완료'?'mint':'lavender'}`}>{check.status==='미확인'?'교수자 확인 전':check.status}</span></div><p>{evidence.interpretation}</p><small>AI 지원 총 {data.guidance.length}회 (최고 안내 수준 L{Math.max(1,...data.guidance.map(g=>g.level))}) · {evidence.limitation}</small></section>
          <section className="teacher-layer"><div className="layer-heading"><strong><ClipboardCheck size={16}/> 4. 교수자의 확인 · 수행 인정 및 지도 메모</strong><select aria-label="증거 확인 상태" value={check.status} onChange={e => {setChecks(prev=>({...prev,[checkKey]:{...check,status:e.target.value}}));setCheckNotice('')}}>{['미확인','확인 완료','추가 확인','해석 수정 필요'].map(s=><option key={s}>{s}</option>)}</select></div><label htmlFor="evidence-note">확인 메모</label><textarea id="evidence-note" rows={2} placeholder="자료와 학생 설명을 대조한 판단을 기록하세요." value={check.note} onChange={e => {setChecks(prev=>({...prev,[checkKey]:{...check,note:e.target.value}}));setCheckNotice('')}} /><div className="check-save"><small role="status">{checkNotice}</small><button className="button secondary" onClick={saveCheck}>확인 저장</button></div></section></div>
        </article>}
      </div>
    </section>
    <section id="guidance-history" className="panel guidance-panel" hidden={detailView!=='guidance'}><div className="section-heading"><SectionTitle icon={MessageCircle} tone="lavender">L1–L4 가이던스 흐름</SectionTitle><span className="count-label">지원 수준 · 능력 점수 아님</span></div><p className="section-note">막힐 때는 지원을 넓히고, 스스로 진행하면 확인 질문으로 줄입니다.</p>
      <div className="guidance-events" aria-label="가이던스 이력 선택">{data.guidance.map((g,i)=><button key={i} aria-pressed={i===supportIndex} onClick={()=>setSupportIndex(i)}><span className={`level-label level-${g.level}`}>L{g.level}</span><time>{g.time}</time></button>)}</div>
      <div className="support-outcome guidance-sequence"><div><small>1 · 막힌 지점</small><strong>{support.reason}</strong></div><div><small>2 · 제공한 도움</small><strong>{support.support}</strong></div><div><small>3 · 후속 행동 요약</small><strong>{support.response}</strong></div><div><small>4 · 기록된 근거</small><strong>{resultEvidence?.title || '연결된 기록 없음'}</strong><p>{resultEvidence && isPerformedEvidence(resultEvidence) && resultEvidence.stage===3 ? '검증 기록이 있습니다. 지원과 수행의 관계는 원자료를 대조해 확인하세요.' : '연결된 자료는 수행·계획 기록입니다. 검증 결과와 지원 효과는 추가 확인이 필요합니다.'}</p>{resultEvidence&&<button className="text-button" onClick={()=>openEvidence(resultEvidence.id)}>{resultEvidence.id} · 연결된 수행 근거 보기</button>}</div></div>
      <details className="guidance-chart-details"><summary>지원 수준과 분포 차트 보기</summary><div className="guidance-visual"><div className="guidance-chart"><h3>지원 수준의 변화 <span>총 {data.guidance.length}회</span></h3><svg viewBox="0 0 620 248" role="img" aria-label={data.guidance.map(g=>`${g.time} L${g.level} ${guidanceLevels[g.level-1]}`).join(', ')}>{[4,3,2,1].map((level,i)=><g key={level}><rect className={`chart-band-${level}`} x="42" y={10+i*50} width="565" height="44" rx="7" /><text x="4" y={37+i*50}>L{level}</text><line x1="42" x2="607" y1={32+i*50} y2={32+i*50} /></g>)}{data.guidance.slice(1).map((g,i)=><path key={i} className={`chart-stroke-${data.guidance[i].level}`} d={`M ${64+i*520/(Math.max(1,data.guidance.length-1))} ${182-(data.guidance[i].level-1)*50} H ${64+(i+1)*520/(Math.max(1,data.guidance.length-1))} V ${182-(g.level-1)*50}`} />)}{data.guidance.map((g,i)=><g key={i}><circle className={`chart-dot-${g.level} ${i===supportIndex?'active':''}`} cx={64+i*520/(Math.max(1,data.guidance.length-1))} cy={182-(g.level-1)*50} r={i===supportIndex?9:6} /><text x={64+i*520/(Math.max(1,data.guidance.length-1))} y="231" textAnchor="middle">{g.time}</text></g>)}</svg></div>
        <div className="guidance-distribution"><h3>수준별 지원 비중</h3><div className="support-stacked-bar" role="img" aria-label={guidanceLevels.map((label,i)=>`L${i+1} ${label} ${levelCounts[i]}회`).join(', ')}>{levelCounts.map((count,i)=>count>0&&<span key={i} className={`chart-fill-${i}`} style={{flex:count}} />)}</div><div className="level-legend">{guidanceLevels.map((label,i)=><div key={label}><b className={`level-label level-${i+1}`}>L{i+1}</b><div className="level-bar-label"><span>{label}</span><span className="level-bar-track"><i className={`chart-fill-${i}`} style={{width:`${levelCounts[i]/data.guidance.length*100}%`}} /></span></div><strong>{levelCounts[i]}회<small>{Math.round(levelCounts[i]/data.guidance.length*100)}%</small></strong></div>)}</div></div></div>
      <p className="evidence-caption">사건 순서대로 표시 · 간격은 실제 경과 시간과 다름</p></details>
      <p className="evidence-caption">개인 AI 채팅 원문은 공개하지 않습니다. 지원 유형과 후속 행동만 요약합니다.</p>
    </section>
    </div></div><section className="panel assessment-feedback"><div className="section-heading"><SectionTitle icon={ClipboardCheck}>교수자 피드백 및 다음 지도 노트 확정</SectionTitle><span className="teach-badge mint">교수자 최종 판단</span></div>
      <div className="ai-guidance-note-proposal">
        <div>
          <strong>AI 추천 지도 노트 초안 (참고용)</strong>
          <p>
            {s.id === 'network'
              ? '“라우팅 테이블을 활용한 오류 진단과 경로 수정 과정이 확인되었습니다. 다음 실습에서는 반환 경로를 포함한 양방향 통신 검증을 독립적으로 수행하도록 지도합니다.”'
              : '“출처 유무에 따른 답변 보류 분기와 모의 검증 기록이 확인되었습니다. 다음 실습에서는 빈 입력과 서버 오류 등 예외 조건까지 독립적으로 검증하도록 지도합니다.”'}
          </p>
        </div>
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            onReview({
              feedback:
                s.id === 'network'
                  ? '라우팅 테이블을 활용한 오류 진단과 경로 수정 과정이 확인되었습니다. 다음 실습에서는 반환 경로를 포함한 양방향 통신 검증을 독립적으로 수행하도록 지도합니다.'
                  : '출처 유무에 따른 답변 보류 분기와 모의 검증 기록이 확인되었습니다. 다음 실습에서는 빈 입력과 서버 오류 등 예외 조건까지 독립적으로 검증하도록 지도합니다.',
            })
          }
        >
          AI 추천 지도 노트 적용
        </button>
      </div>
      <div className="review-feedback-area"><div className="field feedback-field"><label htmlFor="instructor-feedback">잘한 점과 다음에 확인할 내용을 남겨 주세요.</label><textarea aria-label="교수자 피드백" id="instructor-feedback" rows={3} placeholder="잘한 점을 근거와 함께 설명하고 다음 확인 질문을 남겨 주세요." value={review.feedback} onChange={e=>onReview({feedback:e.target.value})} /></div><div className="review-save"><span>학생별로 이 브라우저에 저장됩니다.</span><button className="button primary" onClick={onSave}>평가 저장</button></div></div></section>
  </>
}
