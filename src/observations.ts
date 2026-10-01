import { isPerformedEvidence, type Evidence } from './evidence'

// 확인 가능한 기록의 관찰 비율. 추정 능력 점수 아님.
export const observationRules: Record<string,{condition:string; matches:(e:Evidence)=>boolean}> = {
  '문제 이해': {condition:'문제 범위 또는 최초 판단을 남긴 수행 기록',matches:e=>isPerformedEvidence(e)&&e.stage===0},
  '원인 분석': {condition:'자료를 비교하거나 원인 가설을 대조한 수행 기록',matches:e=>isPerformedEvidence(e)&&e.stage===1},
  '해결 전략 수립': {condition:'선택한 방법을 실제 변경·제작에 적용한 수행 기록',matches:e=>isPerformedEvidence(e)&&e.stage===2},
  '검증': {condition:'조건과 실행 결과가 함께 남아 있는 검증 기록',matches:e=>isPerformedEvidence(e)&&e.stage===3},
  '협업': {condition:'팀 공유 또는 협업 과정이 명시된 기록',matches:e=>e.shared===true||/팀|공유|협업/.test(e.source+' '+e.goal)},
}
export function summarizeObservation(label:string,entries:{name:string;task:string;taskTitle:string;records:Evidence[]}[]){
  const rule=observationRules[label]
  const rows=entries.map(entry=>({...entry,evidence:rule?entry.records.filter(rule.matches):[]}))
  const observed=rows.filter(row=>row.evidence.length>0).length
  return {condition:rule?.condition,rows,total:rows.length,observed,missing:rows.length-observed,rate:rule&&rows.length?Math.round(observed/rows.length*100):null}
}
