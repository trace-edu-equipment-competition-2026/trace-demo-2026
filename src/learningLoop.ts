import type { Assignment } from './assignment'
import type { FusionData, FusionEvidence } from './fusion'
import type { Scenario } from './scenarios'
import { guidanceReply } from './student'

export type SupportProposal = { id:string; level:number; topic:string; text:string; reason:string; status:'pending'|'approved'|'rejected'; time:string; channel?:'private'|'team' }
export type Situation = {basis?:{title:string;raw:string}[];origin?:'AI';purpose?:'선행 단계 추가'|'심화 조건 추가';original?:string;added?:string;expectedEvidence?:string;sourceIds?:string[];reviewedAt?:string;reviewedBy?:string; id:string; title:string; type:string; reason:string; status:'pending'|'active'|'complete'|'rejected'; response?:string; previous:string; cycle:number }
export const stamp=()=>new Date().toLocaleTimeString('ko-KR',{hour12:false})
export const recordId=()=>crypto.randomUUID()
export const policyFor=(data:FusionData,s:Scenario)=>data.assignment ?? s.assignment
export const cycleOf=(data:FusionData)=>data.situation?.cycle ?? 0
export function makeEvidence(data:FusionData,s:Scenario,e:FusionEvidence):FusionEvidence {
 return {...e,id:`R${Date.now().toString(36).slice(-5)}-${data.evidence.length+1}`,time:stamp(),goal:e.goal || policyFor(data,s).goals.join(' · '),cycle:cycleOf(data)}
}
// ponytail: 명시적 시연 상태 규칙. 모델 추론·능력 진단 없음.
export function supportFor(question:string,data:FusionData,s:Scenario,channel:'private'|'team'='private'):SupportProposal|null {
 const policy=policyFor(data,s)
 const levels=['확인 질문','탐색 방향 안내','개념 힌트','도구 활용 힌트']
 const allowed=levels.map((label,i)=>policy.guidance[policy.mode].includes(label)?i+1:0).filter(Boolean)
 if(!allowed.length)return null
 const failed=s.id==='network'&&(Object.values(data.simulation?.checks ?? {}).some(v=>!v) || data.simulation?.lines.slice(-1).some(v=>/100% loss|보완 필요/.test(v)))
 const progress=s.id==='network'&&Object.values(data.simulation?.checks ?? {}).some(Boolean)
 const base=s.reply(question,data.experiment)
 let wanted=data.experiment?1:failed?Math.max(base.level,policy.intervention==='적극'?4:3):progress?Math.min(base.level,2):base.level
 if(policy.intervention==='최소')wanted=Math.min(wanted,2)
 const level=allowed.filter(n=>n<=wanted).at(-1) ?? allowed[0]
 const reason=data.experiment?'검증 근거 공유 후 지원을 줄이고 적용 범위를 확인':failed?'최근 모의 실행에서 실패가 관찰됨':progress?'일부 조건을 확인했으므로 다음 판단을 학생에게 돌려줌':'아직 검증 결과가 없어 관찰과 가설을 구분'
 const fusionTexts=[
 '확인한 사용자 요구와 아직 검증하지 못한 가정을 나눠 볼까요? 다음 실험에서 어떤 결과가 나오면 생각을 바꾸겠나요?',
 '입력·처리·출력을 나누어 어느 부분까지 확인했는지 비교하세요. 가장 불확실한 조건 하나부터 작은 실험으로 확인해 보세요.',
 '자료가 있다는 것과 답변이 타당하다는 것은 다릅니다. 근거가 없는 경우의 처리와 개인정보가 남는 범위를 구분해 설명해 보세요.',
 '정상·자료 없음·개인정보 입력을 같은 조건으로 실행해 결과를 비교하세요. 조건을 바꾸면 이전 결과를 그대로 사용할 수 있는지도 확인하세요.'
 ]
 let text=policy.mode==='교수자 직접'?policy.manualGuidance:s.id==='network'?guidanceReply(level,data.experiment):level===base.level&&!failed&&!data.experiment?base.text:fusionTexts[level-1]
 let topic=levels[level-1]
 if(channel==='team'&&policy.mode!=='교수자 직접'){
  const recent=data.student.teamMessages.filter(m=>m.author!=='AI').slice(-3).map(m=>m.text).join(' ')
  const focus=/갈등|의견|다툼|싸움|불만|충돌/.test(question)?'갈등 조율':/분담|담당|역할/.test(question)?'역할 분담':/분배|업무|일정|마감|부담|할 일/.test(question)?'업무 배분':/갈등|의견|다툼/.test(recent)?'갈등 조율':'프로젝트 논의'
  if(focus){
   topic=focus
   const open={
    '프로젝트 논의':`「${data.plan.name}」의 목표는 ${data.plan.scope}입니다. ${s.id==='network'?'정적 경로 조사 노트와 수정 전 콘솔을 보고, 전체 초기화와 다음 홉 한 항목 수정 중 어느 안이 관찰 결과에 맞는지 비교해 볼까요?':'응답계약 초안과 T02 실패 기록을 보고, API와 화면 중 어디에서 빈 source_ids를 검사할지 비교해 볼까요?'} 두 안을 지지하는 근거와 아직 확인하지 못한 조건은 무엇인가요?`,
    '역할 분담':`「${data.plan.name}」에서 각자 맡을 수 있는 일과 새로 배우고 싶은 일을 먼저 말해 볼까요? ${s.roles.join(' · ')} 중 담당이 비어 있거나 겹치는 부분은 무엇인가요?`,
    '업무 배분':'아직 끝나지 않은 일, 예상 소요 시간, 막힌 부분을 각자 공유해 볼까요? 특정 팀원에게 일이 몰리거나 다른 작업을 기다리는 부분이 있나요?',
    '갈등 조율':'누가 맞는지 정하기 전에, 각자가 관찰한 사실과 원하는 결과를 한 가지씩 말해 볼까요? 서로 다르게 이해한 조건은 무엇인가요?'
   }
   const steps={
    '프로젝트 논의':s.id==='network'?'1. 수정 전 콘솔과 정적 경로 조사 노트를 대조해 관찰과 가설을 나누세요.\n2. 전체 초기화와 다음 홉 한 항목 수정의 영향 범위를 비교하세요.\n3. 팀이 선택한 안, 선택 이유, 같은 조건의 양방향 확인 방법을 남기세요.':'1. 응답계약 초안과 T02 실패 기록을 함께 확인하세요.\n2. API와 화면에서 source_ids를 검사하는 두 안의 장점과 놓칠 조건을 비교하세요.\n3. 팀이 선택한 처리 위치와 이유, 예상 화면을 기록하고 고정 응답 결과와 대조하세요.',
    '역할 분담':`1. ${s.roles.join(' / ')}를 작업 단위로 나누세요.
2. 각 작업에 담당자와 함께 확인할 팀원을 한 명씩 제안하세요.
3. 현재 부담과 학습 기회를 비교하고 팀원 모두 동의한 뒤 확정하세요.`,
    '업무 배분':`남은 작업: ${s.tasks.filter(t=>!data.completed.includes(t.id)).slice(0,3).map(t=>t.title).join(' · ')||'결과와 판단 근거 함께 검토'}
1. 작업별 예상 시간과 선행 작업을 적어 보세요.
2. 부담이 큰 작업을 작게 나누거나 두 사람이 함께 맡는 안을 비교하세요.
3. 담당자·확인 결과·다음 점검 시각을 함께 정하세요.`,
    '갈등 조율':`1. 상대가 말한 우려를 각자 한 문장으로 다시 설명하고 맞는지 확인하세요.
2. 사람에 대한 평가를 빼고 과제 목표·검증 근거·가능한 시간으로 두 안을 비교하세요.
3. 작은 실험 하나로 확인한 뒤 다시 합의하세요. 대화가 어렵거나 모욕·배제가 이어지면 교수자에게 함께 도움을 요청하세요.`
   }
   text=open[focus]+(level>1?'\n\n'+steps[focus]:'')+'\n\n어떤 안이 가능한지 팀원들이 의견을 남겨 주세요. 담당자와 일정은 팀이 합의해 정합니다.'
  }else text+='\n\n한 명은 가설을, 다른 한 명은 확인 방법을 제안하고 결과를 함께 비교해 보세요. 다음에 누가 무엇을 확인할지 팀 채팅에 남겨 주세요.'
 }
 return {id:recordId(),channel,level,topic,text,reason,status:'approved',time:stamp()}
}
export function deliverSupport(data:FusionData,p:SupportProposal):FusionData {
 const key=p.channel==='team'?'teamMessages':'privateMessages'
 return {...data,student:{...data.student,[key]:[...data.student[key],{author:data.assignment?.mode==='교수자 직접'?'교수자 설정 안내':'AI',text:p.text,time:p.time,level:p.level}]},guidance:[...data.guidance,{id:p.id,level:p.level,topic:p.reason,text:p.text,time:p.time}]}
}
// ponytail: 새 활동의 제한된 시연 판단. 실제 AI·능력 진단 없음.
export function nextSituation(data:FusionData,s:Scenario,previous:FusionData=s.project):Situation|null {
 const policy=policyFor(data,s)
 if(policy.mode==='교수자 직접'||data.situation)return null
 const evidence=data.evidence.slice(previous.evidence.length)
 const resources=data.student.resources.filter((r,i)=>r.body!==previous.student.resources[i]?.body)
 const team=data.student.teamMessages.slice(previous.student.teamMessages.length).filter(m=>m.author!=='AI')
 const personal=data.student.privateMessages.slice(previous.student.privateMessages.length).filter(m=>m.author==='유송민')
 const relevant=/경로|라우팅|다음 홉|API|화면|응답|출처|조사|구현|로그인|연동|검증/i
 const blocked=/모르겠|이해.*안|못하겠|막혔|막혀|어려워|어렵|안 돼|안돼|계속 실패/i
 const failed=/\bFAIL\b|100% loss|검증 실패/i
 const artifacts=[...evidence.filter(e=>e.raw&&e.kind==='record').map(e=>({title:e.title,raw:e.raw!})),...resources.map(r=>({title:r.name,raw:r.body}))]
 const failures=artifacts.filter(e=>failed.test(e.raw))
 const strugglingTeam=team.filter(m=>relevant.test(m.text)&&blocked.test(m.text))
 const strugglingPrivate=personal.some(m=>relevant.test(m.text)&&blocked.test(m.text))
 const repeatedFailure=(data.simulation?.lines.length??0)>(previous.simulation?.lines.length??0)&&(data.simulation?.lines.filter(line=>/100% loss/.test(line)).length??0)>=2
 const successfulArtifacts=artifacts.filter(e=>/\bPASS\b|4\/4|검증 통과/.test(e.raw)&&!failed.test(e.raw))
 const verified=data.experiment&&!previous.experiment
 const preparation=!verified&&(failures.length>0||strugglingTeam.length>0||strugglingPrivate||repeatedFailure)
 if(!preparation&&!verified&&!successfulArtifacts.length)return null
 const purpose=preparation?'선행 단계 추가':'심화 조건 추가'
 const basis=preparation?[
  ...failures,...strugglingTeam.map(m=>({title:'팀 채팅 · 구현의 어려움',raw:m.text})),
  ...(strugglingPrivate?[{title:'개인 지원 요약 · 원문 비공개',raw:'구현 개념 또는 방법에 대한 어려움 신호가 관찰되었습니다. 개인 질문 원문은 공유하지 않습니다.'}]:[]),
  ...(repeatedFailure?[{title:'최근 모의 실행 · 반복 실패',raw:data.simulation!.lines.slice(-8).join('\n')}]:[])
 ]:[...successfulArtifacts,...(verified?[{title:'공유된 검증과 판단',raw:data.experimentNote||'현재 검증 조건의 결과가 공유되었습니다.'}]:[])]
 const preferred=s.id==='network'?['오류·장애','요구사항 변경']:preparation?['오류·장애','자원 제한']:['자원 제한','요구사항 변경','역할 변화']
 const type=preferred.find(t=>policy.situations.includes(t))
 if(!type)return null
 const sourceIds=s.id==='network'?['routing-research','route-capture']:['search-research','api-contract','prototype-log']
 const added=s.id==='network'?preparation?'수정 경로를 적용하기 전에 정적 경로의 목적지·다음 홉을 조사하고, 연결 대역 계산과 현재 설정 비교표를 작성하세요.':'추가 단말 PC-C(192.168.30.10)의 연결도 확인하세요. 추가 대역 경로를 점검하고 기존 두 단말의 양방향 결과도 다시 비교하세요.':preparation?'화면과 API를 연결하기 전에 검색·생성의 차이와 자료가 없을 때의 처리 방법을 조사하고, 출처 있음·없음의 응답 비교표를 작성하세요.':type==='역할 변화'?'API 담당자가 검증 담당으로 이동했습니다. 외부 API 없이 공개 자료만으로 안내 기능을 유지하도록 역할과 처리 방식을 다시 합의하세요.':'외부 AI API를 사용할 수 없게 되었습니다. 공개 안내문 조회만으로 필수 안내 기능을 유지하고, 자료 없음·빈 입력·오류 조건을 다시 검증하세요.'
 return {id:recordId(),origin:'AI',basis:basis.map(item=>({...item,raw:item.raw.length>12000?item.raw.slice(0,12000)+'\n[판단 근거 발췌 · 전체 원문은 팀 자료에서 확인]':item.raw})),type,purpose,original:policy.description,added,title:added,sourceIds,
 expectedEvidence:preparation?'조사 문서 원문·참조 자료, 대안 비교표, 선택 이유와 다음 수행 계획':'변경한 설정 또는 코드, 변경 전후 실행 기록, 예상·실제 결과와 적용 범위 설명',
 reason:preparation?'AI가 새 채팅의 구현 어려움 또는 수행 원자료의 실패 신호를 보고 조사·비교 선행 단계를 제안했습니다. 근거는 아래에 연결되어 있으며, 이해도 판단은 교수자가 확인합니다.':'AI가 새로 공유된 성공 결과와 검증 기록을 보고 다른 조건에서 적용 범위를 확인하는 심화 상황을 제안했습니다. 기록된 성공만으로 전체 목표 충족을 확정하지 않습니다.',
 status:policy.mode==='AI 자동'?'active':'pending',previous:data.experimentNote||'아직 검증 완료 전 · 조사와 중간 수행 기록을 참고',cycle:cycleOf(data)+1}
}
export function assessSituation(data:FusionData,s:Scenario,previous:FusionData):FusionData {
 const proposal=nextSituation(data,s,previous)
 if(!proposal)return data
 return proposal.status==='active'?applySituation(data,proposal):{...data,situation:proposal}
}
export function applySituation(data:FusionData,situation:Situation):FusionData {
 return {...data,situation:{...situation,status:'active'},alternative:undefined,experiment:false,completed:data.completed.filter(id=>id!=='test'&&id!=='reflect'),simulation:undefined,experimentNote:'',student:{...data.student,submitted:false},teacherFeedback:data.teacherFeedback}
}
export function applyPolicy(data:FusionData,a:Assignment):FusionData {
 return {...data,assignment:structuredClone(a),brief:a.description,supports:(data.supports??[]).map(p=>p.status==='pending'?{...p,status:'rejected'}:p),situation:data.situation?.status==='pending'?{...data.situation,status:'rejected'}:data.situation}
}
