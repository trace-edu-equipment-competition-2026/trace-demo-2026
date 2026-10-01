import {useState} from 'react'
import { demoSources } from './demoSources'
import type {WorkspaceId} from './scenarios'
import './guidance-demo.css'

// Scripted examples demonstrate support changes, not live model inference.
const guidanceScenes = {
 fusion: [
  {title:'확인 질문',support:'확인 질문',reason:'확인된 사실과 아직 검증하지 않은 조건의 구분',student:'안내문에 있는 질문에는 출처가 나옵니다. 자료에 없는 질문에도 답이 나오는데, 무엇부터 확인해야 할까요?',ai:'답변에 실제 출처가 연결되어 있나요? 자료가 있는 질문과 없는 질문의 결과를 비교하고, 아직 확인하지 못한 조건을 정리해 보세요.'},
  {title:'지원 구체화',support:'개념·도구 활용 힌트',reason:'출처 누락 확인 이후 검증 방법의 어려움에 따른 안내 구체화',student:'비교해 보니 자료에 없는 질문의 source_ids가 비어 있습니다. 답변을 보류해야 한다는 것은 알겠는데, 실제 API 없이 어떻게 검증하나요?',ai:'고정 JSON으로 출처가 있는 응답과 없는 응답을 각각 만들어 보세요. 두 응답을 화면에 연결하고, 출처가 없을 때 답변 보류 안내가 표시되는지 비교해 보세요.'},
  {title:'지원 축소',support:'판단 근거 확인',reason:'학생의 검증 계획 구체화에 따른 직접적 안내 축소',student:'고정 응답으로 출처 유무를 비교했고, 출처가 없을 때 보류 안내가 표시됩니다. 다음에는 빈 질문과 서버 오류도 확인하고 결과를 기록하겠습니다.',ai:'그 검증 조건을 선택한 이유는 무엇인가요? 예상 결과와 실제 결과를 비교해 기록하고, 차이가 있으면 수정할 부분을 스스로 정리해 보세요.'},
 ],
 network: [
  {title:'확인 질문',support:'확인 질문',reason:'실패 현상에 대한 관찰 사실과 탐색 범위 확인',student:'본사에서 지사로 ping이 실패합니다. 아직 어느 구간의 문제인지 모르겠습니다.',ai:'어느 장비까지 응답이 오나요? 확인한 구간과 확인하지 않은 구간을 나누고, 각 결과를 먼저 기록해 보세요.'},
  {title:'지원 구체화',support:'개념·도구 활용 힌트',reason:'인접 구간 확인 이후 반환 경로 검증의 어려움에 따른 안내 구체화',student:'인접 라우터까지는 응답이 옵니다. 지사에서는 응답이 없는데, 돌아오는 경로는 어떤 명령으로 확인하나요?',ai:'통신에는 요청과 응답의 두 경로가 필요합니다. 두 라우터에서 show ip route로 목적지 경로와 다음 홉을 확인하고, 다음 홉이 인접 장비의 주소인지 비교해 보세요.'},
  {title:'지원 축소',support:'판단 근거 확인',reason:'원인 가설과 재검증 계획 수립에 따른 직접적 안내 축소',student:'R2의 다음 홉이 인접 장비 주소와 다릅니다. 이 설정을 수정하고, 같은 조건에서 양방향 ping 결과를 비교하겠습니다.',ai:'그 설정을 원인으로 판단한 근거는 무엇인가요? 수정 전후와 양방향 결과를 기록하고, 예상과 다르면 다음 확인 대상을 스스로 정해 보세요.'},
 ],
}
const followups={
 network:[
  {action:'학생 판단: 전체 초기화는 보류하고 게이트웨이까지 정상인 구간을 먼저 분리했다. 다음 홉 조사 노트와 수정 전 로그를 팀 자료에 올렸다.',raw:'14:08 PC-A> ping 192.168.10.1 → 4/4\n14:08 PC-A> ping 192.168.20.10 → 0/4\n가설: 게이트웨이 이후 경로 또는 반환 경로. 아직 원인 확정 전.'},
  {action:'학생 판단: 요청 경로는 있지만 R2의 다음 홉이 연결 대역과 다르다. 전체 초기화보다 한 항목 수정을 선택하고 같은 조건으로 비교하기로 했다.',raw:'조사: 10.0.0.0/30의 호스트 주소는 .1, .2\nR2 설정: ip route 192.168.10.0 255.255.255.0 10.0.0.9\n선택안: 다음 홉 10.0.0.1로 수정. 아직 실행 전.'},
  {action:'학생 판단: 수정 후 왕복 통신을 확인했다. 결과는 두 단말에 한정되므로 다른 대역까지 복구됐다고 일반화하지 않았다.',raw:'14:16 R2(config)# ip route 192.168.10.0 255.255.255.0 10.0.0.1\n14:17 PC-A> ping 192.168.20.10 → 4/4\n14:18 PC-B> ping 192.168.10.10 → 4/4\n비교 기준: 수정 전 0/4 / 동일 단말·주소 / 다른 대역 미확인.'}
 ],
 fusion:[
  {action:'학생 판단: “응답이 왔다”와 “출처가 있다”를 구분했다. T02 실패 기록과 응답계약을 팀 자료에 올려 화면과 API 중 어디에서 검사할지 논의했다.',raw:'T01: source_ids=[D01], status=ok → 출처 링크 표시\nT02: source_ids=[], status=ok → 근거 없는 답변 표시(FAIL)\n화면 v0.2 / 고정 JSON / 실제 API 미연결'},
  {action:'학생 판단: source_ids가 비었으면 화면에서도 답변을 보류하기로 선택했다. 생성 프롬프트만 고치는 안은 API 없이 검증할 수 없어 보류했다.',raw:'// 학생 수정 예시 · 고정 응답 화면\nconst hasEvidence = response.source_ids.length > 0;\nconst displayed = hasEvidence ? response.answer : "자료를 찾지 못했습니다.";\nT02 재확인: 빈 출처 → 보류 안내 표시(PASS)'},
  {action:'학생 판단: 정상·자료 없음 분기는 비교했지만 빈 질문과 서버 오류는 아직 실행하지 않았다. 추가 확인 범위와 다음 담당자를 팀과 합의했다.',raw:'case,expected,observed,result\nT01,출처 링크,D01 링크,PASS\nT02,답변 보류,자료 없음 안내,PASS\nT03,입력 안내,미실행,NOT_RUN\nT04,재시도 안내,미실행,NOT_RUN'}
 ]
}
export function GuidanceDemo({scenario}:{scenario:WorkspaceId}){
 const [index,setIndex]=useState(0)
 const scenes=guidanceScenes[scenario],scene=scenes[index],followup=followups[scenario][index]
 return <details className="guidance-demo panel">
  <summary>지원 수준 조절 시연</summary>
  <p className="section-note">동일 과제의 연속 대화 · 일반 가이던스는 승인 없이 바로 제공됩니다. 아래 후속 행동과 원자료도 작성된 시연 예시이며 실제 AI 판단·실행 결과가 아닙니다.</p>
  <div className="guidance-scene-switch" role="group" aria-label="시연 장면 선택">{scenes.map((item,i)=><button key={item.title} type="button" aria-pressed={index===i} onClick={()=>setIndex(i)}>{i+1}. {item.title}</button>)}</div>
  <section className="guidance-scene" aria-label={`${scenario==='fusion'?'캠퍼스 길잡이':'본사·지사 연결 복구'} · ${scene.title}`} aria-live="polite">
   <div className="guidance-scene-heading"><h2>{scenario==='fusion'?'캠퍼스 길잡이':'본사·지사 연결 복구'}</h2><span className="teach-badge mint">{scene.support}</span></div>
   <p className="guidance-scene-reason">{scene.reason}</p>
   <div className="guidance-scene-messages">
    <div className="student-message mine"><div><strong>학생</strong><span>확인 결과·어려움</span></div><p>{scene.student}</p></div>
    <div className="student-message"><div><strong>TRACE AI</strong><span>{scene.support}</span></div><p>{scene.ai}</p></div>
   </div>
   <section className="guidance-followup"><h3>학생의 선택과 후속 행동</h3><p>{followup.action}</p><h3>연결된 수행 원자료 · 시연 예시</h3><pre>{followup.raw}</pre><details><summary>중간에 공유한 조사·설계 원문 보기</summary>{demoSources[scenario].slice(0,2).map(r=><section key={r.id}><h3>{r.name} · {r.author}</h3><pre>{r.body}</pre></section>)}</details></section>
  </section>
  <div className="guidance-scene-controls"><button type="button" className="button secondary" disabled={index===0} onClick={()=>setIndex(index-1)}>이전 장면</button><span>{index+1} / {scenes.length}</span><button type="button" className="button primary" disabled={index===scenes.length-1} onClick={()=>setIndex(index+1)}>다음 장면</button></div>
 </details>
}
