import { courseCriteria, guidanceOptions, type Mode } from './assignment'
export type Course = {
  name:string; grade:string; semester:string; students:string; start:string; end:string; description:string;
  competencies:string[]; goals:string[]; standards:string[]; ncs:string[]; curriculum:string[];
  criteria:{name:string;weight:number}[]; selfReview:boolean; peerReview:boolean;
  mode:Mode; intervention:string; guidance:string[]; directAnswers:boolean;
  documents:{name:string;type:string;area:string;updated:string}[];
}
export const defaultCourse:Course = {
  name:'2학년 네트워크 실습',grade:'2학년',semester:'2026년 2학기',students:'네트워크 실습 A반 · 24명',start:'2026-09-01',end:'2026-12-18',
  description:'실제 네트워크 문제를 진단하고, 근거를 바탕으로 수정·검증하는 프로젝트 수업입니다.',
  competencies:['문제 이해','원인 분석','해결 전략 수립','검증','협업'],
  goals:['네트워크 장애 원인을 근거로 설명한다.','진단 도구를 활용해 가설을 비교한다.','해결 전략을 수립하고 설정을 수정한다.','수정 전·후 결과를 검증한다.','팀의 역할을 수행하고 판단을 공유한다.'],
  standards:['주소와 서브넷을 해석하고 통신 경로를 설명한다.','네트워크 설정과 관찰 결과를 비교해 장애를 진단한다.','검증 조건과 결과를 근거로 해결 여부를 설명한다.'],
  ncs:['네트워크 구축 · 시연용 능력단위','네트워크 유지보수 · 시연용 능력단위'],
  curriculum:['네트워크 기초','IP 주소 체계','서브넷 설계','VLAN 구성','라우팅 기초','정적 라우팅','장애 진단 도구','중간 프로젝트 점검','장애 원인 분석','설정 수정과 복구','양방향 검증','보안 정책','통합 네트워크 구축','팀 프로젝트 개선','산출물 검토','최종 발표와 성찰'],
  criteria:courseCriteria, selfReview:true, peerReview:true,mode:'교수자 승인형',intervention:'보통',guidance:guidanceOptions.slice(0,4),directAnswers:false,
  documents:[{name:'네트워크실습 수업계획서.pdf',type:'수업계획',area:'목표 · 일정',updated:'2026-09-01'},{name:'네트워크실습 평가계획.pdf',type:'평가',area:'평가 기준',updated:'2026-09-01'}],
}
export function readCourse(key='trace-course-v1', initial=defaultCourse):Course {
  try { const c=JSON.parse(localStorage.getItem(key)||'null'); if(c && typeof c.name==='string' && ['goals','standards','ncs','curriculum','criteria','documents','guidance'].every(k=>Array.isArray(c[k]))) return {...structuredClone(initial),...c} } catch { /* 저장소 사용 불가 시 데모 과목 사용. */ }
  return structuredClone(initial)
}
export type TeachingTarget = {task?:string;team?:number;student?:string}
export const dashboardProjects = (title:string) => [
  {id:'current',name:title,short:'네트워크 장애 진단',support:[28,19,12,8,3],weekly:[8,16,28,37,46,54,61]},
  {id:'vlan',name:'VLAN 분리 및 부서 간 통신 검증',short:'VLAN 통신 검증',support:[20,15,14,7,4],weekly:[5,12,20,28,36,42,49]},
]
