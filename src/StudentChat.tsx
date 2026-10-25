import {useEffect,useRef,useState} from 'react'
import {Bot,ClipboardPen,Files,MessageCircle,RotateCcw,UsersRound} from 'lucide-react'
import {useWorkspace} from './WorkspaceContext'
import {deliverSupport,policyFor,stamp,supportFor} from './learningLoop'
import {SectionTitle} from './SectionTitle'
import {GuidanceDemo} from './GuidanceDemo'
import {ChatRecord} from './ChatRecord'
import './guidance-demo.css'

export function StudentChat({view,task,onTask,onNavigate,onRecords,onResource}:{view:'ai'|'chat';task:string;onTask:(id:string)=>void;onNavigate:(view:string)=>void;onRecords:()=>void;onResource:(index:number)=>void}){
 const {scenario:s,data,setData}=useWorkspace()
 const personal=view==='ai',policy=policyFor(data,s)
 const [text,setText]=useState(''),[teamAi,setTeamAi]=useState(false),[request,setRequest]=useState(data.request),[notice,setNotice]=useState(''),[recordTarget,setRecordTarget]=useState<string|null>(null)
 const log=useRef<HTMLDivElement>(null),composer=useRef<HTMLTextAreaElement>(null)
 const allMessages=personal?data.student.privateMessages:data.student.teamMessages
 const start=personal?Math.min(data.student.privateConversationStart??0,allMessages.length):0
 const messages=allMessages.slice(start)
 useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight},[allMessages.length])
 const teamPrompts=[s.id==='network'?'프로젝트 해결 방향과 검증 방법을 상의하고 싶어요':'API와 화면 중 어디에서 출처를 검사할지 상의하고 싶어요','역할 분담을 함께 정하고 싶어요','업무가 한 사람에게 몰렸어요','의견이 달라 갈등을 조율하고 싶어요']
 function send(){
  if(!text.trim())return
  const channel=personal?'private':'team',key=personal?'privateMessages':'teamMessages'
  const asksAi=personal||teamAi,p=asksAi?supportFor(text,data,s,channel):null
  const next={...data,student:{...data.student,[key]:[...data.student[key],{author:'유송민',text:text.trim(),time:stamp(),supportId:p?.id}]}}
  if(!asksAi){setData(next);setNotice('')}
  else if(!p){setData(next);setNotice('허용된 시연 가이던스가 없습니다. 교수자에게 지도를 요청해 주세요.')}
  else{
   const queued={...next,supports:[...(data.supports??[]),p]}
   setData(p.status==='approved'?deliverSupport(queued,p):queued)
   setNotice(personal?'답변 아래에서 수행과 판단을 기록할 수 있습니다.':'팀원 모두가 함께 볼 수 있는 가이던스를 남겼습니다.')
  }
  setText('');setRecordTarget(null)
 }
 function newConversation(){
  setData(prev=>({...prev,student:{...prev.student,privateConversationStart:prev.student.privateMessages.length}}))
  setText('');setRecordTarget(null);setNotice('새 대화를 시작합니다. 저장한 학습 기록은 유지됩니다.');composer.current?.focus()
 }
 function toggleRecord(key:string){
  setRecordTarget(recordTarget===key?null:key)
  if(recordTarget!==key)requestAnimationFrame(()=>{
   document.getElementById('chat-record-title')?.focus({preventScroll:true})
   const turn=document.getElementById('chat-record')?.closest('.chat-turn')
   if(log.current&&turn)log.current.scrollTop+=turn.getBoundingClientRect().top-log.current.getBoundingClientRect().top-12
  })
 }
 return <>
  <div className={`student-chat-layout ${personal?'personal-support-layout':''}`}>
   <section className="panel student-chat-panel">
    <div className="section-heading"><SectionTitle icon={MessageCircle}>{personal?'개인 학습 지원':'팀 대화와 AI 가이던스'}</SectionTitle>{personal?<button className="text-button new-conversation" onClick={newConversation}><RotateCcw size={16}/>새 대화</button>:<span className="teach-badge mint">팀 공유</span>}</div>
    <p className="course-demo-note">{personal?'질문 → AI 답변 → 수행·판단 기록. 답변과 폼은 시연 규칙에 따른 예시입니다.':'프로젝트 방향·구현 방법·자료 조사·검증을 상의하거나 역할 분담·갈등 조율이 필요할 때 가이던스를 요청하세요. 일반 지원은 바로 제공되며 추가 문제 상황만 교수자 승인 후 적용됩니다. (시연)'}</p>
    <div ref={log} className="student-messages" role="log" aria-label={personal?'개인 대화':'팀 대화'}>
     {!messages.length&&<div className="private-chat-empty"><Bot size={26}/><strong>어디에서 막혔나요?</strong><p>아래 예시 질문을 선택하거나 직접 질문해 보세요.<br/>AI 답변 아래에서 기록 폼을 열 수 있습니다.</p></div>}
     {messages.map((m,i)=>{
      const answer=m.author==='AI'||m.author==='교수자 설정 안내'
      const supportId=m.supportId??(answer?allMessages[start+i-1]?.supportId:undefined)
      const key=supportId??`message-${start+i}`
      return <div key={`${key}:${start+i}`} className={`chat-turn ${m.author==='유송민'?'mine':''}`}>
       <div className={`student-message ${m.author==='유송민'?'mine':answer?'ai-guidance':''}`}><div><strong>{answer&&<Bot size={16} aria-hidden="true"/>}{m.author==='AI'?'TRACE AI':m.author}</strong>{!personal&&answer&&<span className="chat-guidance-tag">팀 가이던스</span>}<time>{m.time}</time></div><p>{m.text}</p>
        {!personal&&m.author==='유송민'&&m.supportId&&<small className="chat-guidance-state">AI 가이던스 요청 · {{pending:'이전 지원 요청 · 다시 질문해 주세요',approved:'답변 전달됨',rejected:'제공 보류 · 교수자에게 확인해 주세요'}[(data.supports??[]).find(p=>p.id===m.supportId)?.status??'pending']}</small>}
        {!personal&&m.resourceIndex!==undefined&&data.student.resources[m.resourceIndex]&&<button className="chat-document-link" onClick={()=>onResource(m.resourceIndex!)}><Files size={18}/>{data.student.resources[m.resourceIndex].name}</button>}
       </div>
       {personal&&answer&&<><button className="text-button chat-record-toggle" aria-expanded={recordTarget===key} aria-controls={recordTarget===key?'chat-record':undefined} onClick={()=>toggleRecord(key)}><ClipboardPen size={16}/>{recordTarget===key?'기록 폼 접기':'수행·판단 기록 열기'}</button>{recordTarget===key&&<ChatRecord key={key} message={{...m,supportId}} messageKey={key} task={task} onTask={onTask} onRecords={onRecords}/>}</>}
      </div>
     })}
    </div>
    <div className="student-prompts">{(personal?s.prompts:teamPrompts).map(prompt=><button key={prompt} className="text-button" onClick={()=>{setText(prompt);if(!personal)setTeamAi(true);composer.current?.focus()}}>{prompt}</button>)}</div>
    <form className="student-composer" onSubmit={e=>{e.preventDefault();send()}}>
     {!personal&&<div className="compact-tabs team-chat-mode" role="group" aria-label="팀 채팅 작성 방식"><button type="button" aria-pressed={!teamAi} onClick={()=>setTeamAi(false)}><UsersRound size={16}/>팀 메시지</button><button type="button" aria-pressed={teamAi} onClick={()=>setTeamAi(true)}><Bot size={16}/>AI 가이던스</button></div>}
     <label className="field">{personal?'개인 질문':'팀 메시지'}<textarea aria-label={personal?'개인 질문':'팀 메시지'} ref={composer} id={personal?'student-private-question':'student-team-message'} rows={2} maxLength={2000} value={text} onChange={e=>setText(e.target.value)} placeholder={personal?s.prompts[0]:teamAi?'팀이 막힌 상황과 필요한 도움을 알려 주세요.':'확인한 내용과 다음 행동을 팀원에게 남겨 주세요.'}/></label>
     <div><button type="button" className="text-button" onClick={()=>onNavigate(personal?'studio':'documents')}>{personal?'작업실에서 확인 →':'팀 자료 공유 →'}</button><button className="button primary" disabled={!text.trim()}>{personal?'AI에게 질문하기':teamAi?'AI 가이던스 요청':'팀에 보내기'}</button></div>
    </form>
    <p className="chat-persistence-note">{personal?'대화는 이 브라우저에 보관됩니다. 다시 시연하려면 ‘새 대화’를 눌러 주세요.':'팀 대화와 개인 대화는 별도로 보관됩니다.'}</p>
    {notice&&<p className="chat-notice" role="status">{notice}</p>}
   </section>
   <aside className="student-chat-aside">
    <section className="panel chat-context-panel"><div className="section-heading"><SectionTitle icon={ClipboardPen}>현재 수행 맥락</SectionTitle></div><h3>{data.plan.name}</h3><p>{data.plan.scope}</p><h3>다음에 확인할 것</h3><p className="section-note">{s.need}</p><details><summary>적용 중인 지원 정책</summary><p className="section-note">{policy.mode} / {policy.intervention} 개입<br/>{policy.guidance[policy.mode].join(' · ')}</p></details></section>
    <section className="panel chat-teacher-panel"><div className="section-heading"><SectionTitle icon={ClipboardPen}>교수자에게 함께 점검받기</SectionTitle></div><label className="field">공유할 지도 요청<textarea id="student-guidance-request" rows={4} value={request} onChange={e=>setRequest(e.target.value)} placeholder={s.project.request}/></label><button className="button secondary" disabled={!request.trim()} onClick={()=>{setData({...data,request:request.trim(),feedbackSent:false});setNotice('교수자 팀별 모니터링에 지도 요청을 남겼습니다.')}}>지도 요청 보내기</button><p className="fusion-feedback">{data.feedbackSent?data.teacherFeedback:'교수자 답변을 기다리거나, 시도한 내용과 함께 질문을 남겨 주세요.'}</p></section>
   </aside>
  </div>
  {personal&&<GuidanceDemo scenario={s.id}/>}
 </>
}
