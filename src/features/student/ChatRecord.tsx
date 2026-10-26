import {useState} from 'react'
import {ArrowRight,Check,ClipboardPen} from 'lucide-react'
import {useWorkspace} from '@/components/layout/WorkspaceContext'
import {makeEvidence,stamp} from '@/domain/learningLoop'
import type {StudentMessage} from '@/domain/student'

// 대화 단계별 고정 폼과 입력 예시. 실제 AI 폼 생성 아님.
const recordForms = [
 {title:'관찰한 사실 정리',stage:1,fields:['직접 확인한 사실','아직 확인하지 못한 점']},
 {title:'방법 선택과 실행 기록',stage:2,fields:['선택한 방법과 이유','직접 한 행동과 확인 결과']},
 {title:'검증 결과 돌아보기',stage:3,fields:['비교 결과와 판단 근거','남은 한계와 다음 행동']},
 {title:'AI 제안에 대한 나의 판단',stage:1,fields:['채택·수정·거부한 이유','내가 선택한 접근과 확인 방법']},
]
const recordExamples = {
 network:[
  ['게이트웨이 192.168.10.1은 4/4 응답, 지사 PC 192.168.20.10은 0/4 응답이었다.','게이트웨이 이후 경로와 반환 경로는 미확인이다. 전체 초기화를 보류하고 두 라우터의 경로를 비교한다.'],
  ['R2의 다음 홉만 10.0.0.1로 수정하기로 했다. 현재 값 10.0.0.9는 인접 장비 주소와 달라, 전체 초기화보다 변경 범위를 좁힐 수 있다.','show ip route와 10.0.0.0/30의 호스트 주소를 대조했다. 설정 수정은 아직 실행 전이며, 수정 후 같은 조건으로 양방향 ping을 확인할 예정이다.'],
  ['다음 홉 수정 전 0/4였던 통신이 수정 후 양방향 모두 4/4로 바뀌었다. 같은 단말·주소로 비교해 반환 경로 수정의 영향을 확인했다.','확인한 범위는 두 PC 사이의 통신이다. 다른 대역까지 복구됐다고 일반화하지 않고 추가 대역을 검증한다.'],
 ],
 fusion:[
  ['T01은 D01 출처 링크가 표시됐다. T02는 source_ids가 비었는데도 근거 없는 답변이 표시됐다.','출처가 없을 때 답변을 보류하는 분기는 미검증이다. 실제 API 없이 고정 JSON으로 두 조건을 비교한다.'],
  ['화면에서 source_ids가 비었는지 검사해 답변을 보류하기로 했다. 실제 API 없이도 고정 응답으로 확인할 수 있기 때문이다.','출처 유무에 따른 화면 분기를 추가했다. T02를 다시 확인하니 빈 출처에서 “자료를 찾지 못했습니다.”가 표시됐다.'],
  ['T01은 출처 링크, T02는 답변 보류가 예상대로 표시됐다. 수정 전 근거 없는 답변이 나오던 T02와 같은 조건으로 비교했다.','빈 질문 T03과 서버 오류 T04는 미실행이다. 다음 검증에서 입력 안내와 재시도 안내를 확인하고 결과를 팀과 공유한다.'],
 ],
}

export function ChatRecord({message,messageKey,task,onTask,onRecords}:{message:StudentMessage;messageKey:string;task:string;onTask:(id:string)=>void;onRecords:()=>void}){
 const {scenario:s,data,setData}=useWorkspace()
 const stage=message.recordStage??((message.level??1)>=3?1:0)
 const [judging,setJudging]=useState(false),[notice,setNotice]=useState('')
 const index=judging?3:stage,form=recordForms[index]
 const draftKey=`${messageKey}:${task}:${index}`
 const draft=data.chatRecords?.drafts[draftKey]
 const values=draft?.values??['',''],decision=draft?.decision??'수정',resultId=draft?.resultId??''
 const results=data.evidence.filter(e=>e.stage===3&&e.raw&&e.kind==='record')
 const linked=results.find(e=>e.id===resultId)
 const detail=(judging?`판단: ${decision}\n\n`:'')+form.fields.map((label,i)=>`${label}: ${values[i].trim()}`).join('\n\n')+(judging?`\n\n검증: ${linked?.title??'결과 미연결 · 검증 후 다시 기록 가능'}`:'')
 const savedRecord=draft?.evidenceId?data.evidence.find(e=>e.id===draft.evidenceId):undefined
 const saved=!!savedRecord&&savedRecord.detail===detail,ready=values.every(value=>value.trim())
 function edit(change:Partial<NonNullable<typeof draft>>){
  setNotice('')
  setData(prev=>({...prev,chatRecords:{taskId:task,drafts:{...prev.chatRecords?.drafts,[draftKey]:{values,...draft,...change}}}}))
 }
 function save(){
  if(!ready||saved)return
  setData(prev=>{
   const previous=draft?.evidenceId?prev.evidence.find(e=>e.id===draft.evidenceId):undefined
   const title=judging?`AI 제안 검토 · ${decision}`:`${s.tasks.find(t=>t.id===task)?.title} · ${form.title}`
   const evidence=previous?{...previous,title,detail,time:stamp(),resultId:linked?.id,raw:judging?`공유한 AI 제안: ${message.text}${linked?`\n\n연결 검증 ${linked.id}\n${linked.raw}`:''}`:undefined}:makeEvidence(prev,s,{
    title,
    detail,owner:'유송민',source:judging?'학생이 선택하여 공유한 AI 제안 검토':'개인 AI 지원 · 학생 설명 (시연·원자료 미연결)',
    criterion:judging?'AI 활용·판단':'해결 과정',stage:form.stage,kind:'reflection',time:stamp(),supportId:message.supportId,resultId:linked?.id,
    raw:judging?`공유한 AI 제안: ${message.text}${linked?`\n\n연결 검증 ${linked.id}\n${linked.raw}`:''}`:undefined,
   })
   return {...prev,evidence:previous?prev.evidence.map(e=>e.id===previous.id?evidence:e):[...prev.evidence,evidence],chatRecords:{taskId:task,drafts:{...prev.chatRecords?.drafts,[draftKey]:{values,decision,resultId,evidenceId:evidence.id}}}}
  })
  setNotice('나의 학습 기록에 저장했습니다.')
 }
 function fillExample(){
  const examples=recordExamples[s.id][judging?1:stage]
  edit({values:values.map((value,i)=>value.trim()?value:examples[i])})
  setNotice('빈칸에 시연 예시를 채웠습니다. 내 수행에 맞게 수정해 주세요.')
 }
 return <form id="chat-record" className="guidance-record" aria-labelledby="chat-record-title" onSubmit={e=>{e.preventDefault();save()}}>
  <div className="guidance-record-heading"><h3 id="chat-record-title" tabIndex={-1}><ClipboardPen size={18} aria-hidden="true"/>수행과 판단 기록</h3><span>{form.title}</span></div>
  <div className="compact-tabs" role="group" aria-label="기록 유형"><button type="button" aria-pressed={!judging} onClick={()=>{setJudging(false);setNotice('')}}>수행 기록</button><button type="button" aria-pressed={judging} onClick={()=>{setJudging(true);setNotice('')}}>AI 제안 판단</button></div>
  <label className="field guidance-record-task">기록할 작업<select aria-label="기록할 작업" value={task} onChange={e=>{onTask(e.target.value);setNotice('');setData(prev=>({...prev,chatRecords:{taskId:e.target.value,drafts:prev.chatRecords?.drafts??{}}}))}}>{s.tasks.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
  {judging&&<div className="guidance-record-fields"><label className="field">나의 판단<select aria-label="나의 판단" value={decision} onChange={e=>edit({decision:e.target.value})}>{['채택','수정','거부'].map(value=><option key={value}>{value}</option>)}</select></label><label className="field">연결할 검증 근거<select aria-label="연결할 검증 근거" value={resultId} onChange={e=>edit({resultId:e.target.value})}><option value="">아직 검증 전 · 판단과 계획만 공유</option>{results.map(e=><option key={e.id} value={e.id}>{e.title} · {e.time}</option>)}</select></label></div>}
  <div className="guidance-record-fields">{form.fields.map((label,i)=><label className="field" key={`${index}:${i}`}>{label}<textarea aria-label={label} rows={2} required maxLength={2000} value={values[i]} onChange={e=>edit({values:values.map((value,n)=>n===i?e.target.value:value)})}/></label>)}</div>
  <p className="guidance-record-note">{judging?'선택한 AI 제안과 작성한 판단을 공유합니다. 개인 질문 원문은 제외됩니다.':'두 항목 모두 입력 · 저장한 설명만 교수자에게 공유 · 대화 원문 제외'}</p>
  <div className="guidance-record-actions"><button type="button" className="button secondary" disabled={ready} onClick={fillExample}>빈칸 예시 채우기</button><button className="button primary" disabled={!ready||saved}>{saved?<><Check size={16}/>저장됨</>:savedRecord?'수정한 기록 저장':judging?'판단 근거 교수자에게 공유':'수행 기록 저장'}</button></div>
  <div className="guidance-record-result"><span role="status">{notice||(saved?'저장한 기록을 수정할 수 있습니다.':'작성 중인 내용은 이 브라우저에 임시 보관됩니다.')}</span>{savedRecord&&<button type="button" className="text-button" onClick={onRecords}>나의 학습 기록 보기 <ArrowRight size={16}/></button>}</div>
 </form>
}
