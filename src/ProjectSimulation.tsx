import { useState } from 'react'
import { useWorkspace } from './WorkspaceContext'
import { cycleOf, makeEvidence, stamp } from './learningLoop'

export function ProjectSimulation(){
 const {scenario:s,data,setData}=useWorkspace()
 const changed=!!data.situation && ['active','complete'].includes(data.situation.status)
 const extended=changed&&data.situation?.purpose!=='선행 단계 추가'
 const [target,setTarget]=useState(data.simulation?.target || s.nodes[0][0])
 const [command,setCommand]=useState(''),[rules,setRules]=useState(data.simulation?.rules || [false,false,...(extended&&s.id==='fusion'?[false]:[])])
 const [checks,setChecks]=useState<Record<string,boolean>>(data.simulation?.checks || {})
 const [extensionFixed,setExtensionFixed]=useState(data.simulation?.extensionFixed ?? false)
 const [lines,setLines]=useState<string[]>(data.simulation?.lines || ['TRACE 모의 실행 환경 · 실제 장비·코드·API에는 연결되지 않습니다.'])
 const [note,setNote]=useState(data.simulation?.note ?? data.experimentNote),[notice,setNotice]=useState('')
 const network=s.id==='network'
 const config=network?{
  labels:['수정 전 실패 결과를 비교 기준으로 사용','반대 방향의 결과까지 확인'],
  conditions:['경로 수정','본사 → 지사','지사 → 본사',...(extended?['추가 단말 PC-C']:[])],
  commands:['show ip route','show ip interface brief','ping 192.168.20.10','ping 192.168.10.10',...(extended?['ping 192.168.30.10']:[])],
  placeholder:'예: show ip route',title:extended?'추가 대역의 복구 재검증':'양방향 복구 검증'
 }:{
  labels:['근거 자료가 없으면 답변 보류','질문 로그에서 학번 가리기',...(extended?['외부 API 대신 공개 자료 조회로 처리']:[])],
  conditions:['등록된 질문','자료에 없는 질문','개인정보 포함 질문',...(extended?['외부 API 중단']:[])],
  commands:['GET /schema','TEST registered','TEST unknown','TEST privacy','GET /status',...(extended?['TEST offline']:[])],
  placeholder:'예: TEST unknown',title:extended?'자원 변경 후 대안 처리 재검증':'근거와 개인정보 경계 조건 검증'
 }
 function persist(next:Partial<NonNullable<typeof data.simulation>>){setData({...data,...(next.checks?{experiment:false,student:{...data.student,submitted:false},situation:data.situation?.status==='complete'?{...data.situation,status:'active' as const}:data.situation}:{}),simulation:{target,rules,checks,lines,note,extensionFixed,...next}})}
 const passed=config.conditions.every(c=>checks[c])&&rules.every(Boolean)&&(!changed||!!data.situation?.response)
 function run(value=command){
  const input=value.trim().replace(/\s+/g,' ');if(!input)return
  let output='지원하는 조회·시험 요청을 확인하거나, 다른 해결 방법의 수행자료를 제출해 주세요.'
  let nextChecks={...checks},student={...data.student},extraFixed=extensionFixed
  if(network){
   if(input==='show ip route')output=target==='R1'?`S 192.168.20.0/24 via 10.0.0.2${extended?`\n192.168.30.0/24: ${extraFixed?'via 10.0.0.2':'경로 없음 · PC-C는 R2 뒤 추가 대역'}`:''}`:target==='R2'?`S 192.168.10.0/24 via ${student.routeFixed?'10.0.0.1':'10.0.0.9'}${extended?'\nC 192.168.30.0/24 directly connected':''}`:'라우터를 선택해 경로를 확인하세요.'
   else if(input==='show ip interface brief')output='R1: 10.0.0.1 up/up\nR2: 10.0.0.2 up/up'
   else if(input.startsWith('ip route ')){
    if(target==='R2'&&input==='ip route 192.168.10.0 255.255.255.0 10.0.0.1'){student={...student,routeFixed:true,forward:false,reverse:false};nextChecks={'경로 수정':true};output='R2 정적 경로 수정됨. 두 PC의 양방향 결과를 확인하세요.'}
    else if(extended&&target==='R1'&&input==='ip route 192.168.30.0 255.255.255.0 10.0.0.2'){extraFixed=true;nextChecks={};output='R1 추가 대역 경로 수정됨. 기존 두 방향과 PC-C를 다시 확인하세요.'}
    else output='목적지·마스크·실제 인접 주소와 실행 대상을 비교하세요. 설정은 변경되지 않았습니다.'
   }else if(input.startsWith('ping ')){
    const forward=target==='PC-A'&&input==='ping 192.168.20.10',reverse=target==='PC-B'&&input==='ping 192.168.10.10',extra=extended&&target==='PC-A'&&input==='ping 192.168.30.10'
    if(!forward&&!reverse&&!extra)output='PC-A에서 지사 PC 또는 추가 단말, PC-B에서 본사 PC를 확인하세요.'
    else if(!student.routeFixed||(extra&&!extraFixed)){output='Request timed out. Sent = 4, Received = 0 (100% loss)';nextChecks[extra?'추가 단말 PC-C':forward?'본사 → 지사':'지사 → 본사']=false}
    else{student={...student,forward:student.forward||forward,reverse:student.reverse||reverse};nextChecks[extra?'추가 단말 PC-C':forward?'본사 → 지사':'지사 → 본사']=true;nextChecks['경로 수정']=true;output='Reply received · 4/4 · 0% loss'}
   }
  }else{
   if(input==='GET /schema')output='{ answer, source_ids, status } · 문서 ID로 출처 연결'
   if(input==='GET /status')output=`답변 보류 규칙: ${rules[0]?'설정':'미설정'} / 식별 정보 가림: ${rules[1]?'설정':'미설정'}${extended?` / 공개 자료 조회: ${rules[2]?'설정':'미설정'}`:''}`
   const i=['TEST registered','TEST unknown','TEST privacy',...(extended?['TEST offline']:[])].indexOf(input)
   if(i>=0){const ok=i===0||rules[i-1];nextChecks[config.conditions[i]]=ok;output=i===0?'도서관 운영: 평일 09:00–18:00 · 가상 안내문 D01':i===1?ok?'자료 없음 · 추측 답변 중단. 담당 부서 확인 안내':'보완 필요 · 자료가 없는 질문에 근거 없는 답변을 생성함':i===2?ok?'저장 기록: [학번 가림] 학생의 이용 문의':'보완 필요 · 가짜 학번 20260001이 로그에 남음':ok?'외부 API 연결 없음 · 공개 안내문 D01 조회로 필수 안내 제공':'보완 필요 · 외부 API 중단으로 응답 실패'}
  }
  const nextLines=[...lines,`${stamp()} · ${target}> ${input}`,output].slice(-100)
  setChecks(nextChecks);setExtensionFixed(extraFixed);setLines(nextLines);setCommand('');setData({...data,...(input.startsWith('ip route ')||/100% loss|보완 필요/.test(output)?{experiment:false,situation:data.situation?.status==='complete'?{...data.situation,status:'active' as const}:data.situation}:{}),student,simulation:{target,rules,checks:nextChecks,lines:nextLines,note,extensionFixed:extraFixed}})
 }
 function publish(){
  if(!passed||!note.trim())return
  const raw=`모의 실행 · ${stamp()} · 수행 회차 ${cycleOf(data)+1}\n조건: ${config.labels.filter((_,i)=>rules[i]).join(' / ')}\n${data.situation?.title??'초기 과제 조건'}\n\n${lines.join('\n')}\n\n검증 결과\n${Object.entries(checks).map(([k,v])=>`${k}: ${v?'통과':'실패'}`).join('\n')}`
  const e=makeEvidence(data,s,{title:config.title,detail:note.trim(),raw,owner:'유송민',source:'프로젝트 작업실 · 모의 검증',criterion:'검증',stage:3,kind:'record',time:stamp()})
  const resource={id:`project-verification-${e.id}`,name:config.title,kind:'Learning Evidence',body:`${raw}\n\n학생 설명\n${note.trim()}`,author:'유송민',version:1}
  setData({...data,experiment:true,experimentNote:note.trim(),completed:[...new Set([...data.completed,'test'])],evidence:[...data.evidence,e],situation:changed&&data.situation?{...data.situation,status:'complete'}:data.situation,student:{...data.student,submitted:true,resources:[...data.student.resources,resource],teamMessages:[...data.student.teamMessages,{author:'유송민',text:`${config.title}과 판단 근거를 팀 자료에 공유했습니다.`,time:stamp()}]}})
  setNotice('검증 결과를 팀 자료와 나의 학습 기록에 남겼습니다. 원자료와 학생 설명을 따로 보존했습니다.')
 }
 return <><section className="panel"><div className="section-heading"><h2>실행 환경과 검증</h2><span className="teach-badge yellow">모의 실행</span></div><p className="section-note">{data.plan.scope}</p><div className="network-topology" aria-label="프로젝트 구성도">{s.nodes.map(([name,info])=><div key={name}><span>{name}</span><small>{info}</small></div>)}</div><div className="fusion-prototype"><div><h3>검증 조건</h3>{config.labels.map((label,i)=><label className="student-learning-check" key={label}><input type="checkbox" checked={!!rules[i]} onChange={e=>{const nextRules=config.labels.map((_,j)=>i===j?e.target.checked:!!rules[j]);setRules(nextRules);setChecks({});persist({rules:nextRules,checks:{}});setNotice('조건이 바뀌었습니다. 결과를 다시 확인해 주세요.')}}/>{label}</label>)}<label className="field">실행 대상<select aria-label="실행 대상" value={target} onChange={e=>{setTarget(e.target.value);persist({target:e.target.value})}}>{s.nodes.map(n=><option key={n[0]}>{n[0]}</option>)}</select></label><p className="course-demo-note">{s.moduleEvidence} · 시연용으로 정의된 요청만 처리합니다.</p>{network&&<details><summary>설정 명령 형식</summary><p>ip route 목적지대역 서브넷마스크 다음홉</p><p>조회한 경로와 실제 연결을 비교해 각 값을 직접 선택하세요.</p></details>}</div><div><pre role="log" aria-label="모의 실행 기록" className="student-console">{lines.join('\n')}</pre><form className="console-form" onSubmit={e=>{e.preventDefault();run()}}><label htmlFor="project-command">명령·요청</label><input id="project-command" placeholder={config.placeholder} value={command} onChange={e=>setCommand(e.target.value)}/><button className="button primary">실행</button></form></div></div><div className="command-shortcuts">{config.commands.map(c=><button className="text-button" key={c} onClick={()=>run(c)}>{c}</button>)}</div><div className="fusion-test-checks">{config.conditions.map(c=><span key={c} className={checks[c]?'passed':''}>{checks[c]===undefined?'미확인':checks[c]?'확인 완료':'보완 필요'} · {c}</span>)}</div></section><section className="panel"><div className="section-heading"><div className="form-heading-copy"><h2>수행자료와 검증 기록</h2><small className="form-heading-note">AI가 대화 내용과 입력 자료를 대조하고, 추가 질문으로 보완하여 과정증거로 활용하는 흐름입니다. (기능 설계 시연)</small></div><span className="count-label">원자료 + 나의 설명</span></div><label className="field">어떤 근거로 판단했고, 무엇을 더 확인해야 하나요?<textarea rows={4} value={note} onChange={e=>{setNote(e.target.value);persist({note:e.target.value})}} placeholder={s.guidance}/></label><p className="course-demo-note">{extended?'변경 조건에 대한 재분석·팀 합의와 모든 시험 결과를 확인한 뒤 공유하세요.':'모든 결과와 검증 조건을 확인한 뒤 판단 근거를 남기세요.'} 공유 시점의 실행 기록을 별도로 보존하며 이전 회차의 근거는 유지됩니다.</p><button className="button primary" disabled={!passed||!note.trim()} onClick={publish}>검증 근거 팀에 공유</button>{notice&&<p role="status">{notice}</p>}</section></>
}
