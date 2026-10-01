export type StudentMessage={author:string;text:string;time:string;level?:number;supportId?:string;resourceIndex?:number}
export type TeamResource={demo?:boolean;id?:string;name:string;kind:string;body:string;author?:string;updated?:string;version?:number;dataUrl?:string;mime?:string}
export type StudentState={resourceSchema?:number;routeFixed:boolean;forward:boolean;reverse:boolean;note:string;submitted:boolean;teamMessages:StudentMessage[];privateMessages:StudentMessage[];resources:TeamResource[];checks:string[]}
import { demoSources } from './demoSources'
export const studentInitial:StudentState={resourceSchema:2,routeFixed:false,forward:false,reverse:false,note:'',submitted:false,checks:[],teamMessages:[{author:'김민준',text:'R1에서 지사 대역으로 가는 경로는 확인했어. R2의 돌아오는 경로도 비교해 보자.',time:'14:08'},{author:'윤서준',text:'통신 실패 화면을 팀 자료에 올렸어. 수정 전 결과로 사용할게.',time:'14:10'},{author:'유송민',text:'R2 설정을 확인하고, 수정한 다음 양방향으로 검증해 볼게.',time:'14:11'},{author:'유송민',text:'연결 대역은 10.0.0.0/30인데 R2 설정에는 10.0.0.9가 있어. 조사 노트와 수정 전 콘솔 기록을 올렸어. 전체 초기화와 다음 홉 한 항목 수정 중 어떤 접근이 근거에 맞을까?',resourceIndex:7,time:'14:12'},{author:'윤서준',text:'다음 홉부터 한 항목씩 비교하자. 수정 전 실패 기록을 기준으로 양방향 결과를 같은 조건에서 확인하면 원인을 설명할 수 있을 것 같아.',resourceIndex:8,time:'14:13'}],privateMessages:[{author:'유송민',text:'본사에서 지사로 ping이 안 돼요. 어느 쪽부터 확인해야 할까요?',time:'14:03'},{author:'AI',text:'먼저 관찰한 사실을 정리해 볼까요? 어느 장비까지 응답이 오고, 어느 구간부터 응답이 멈추나요?',time:'14:03',level:1}],resources:[{name:'장애 진단 미션',kind:'과제 안내',body:'본사 PC(192.168.10.10)와 지사 PC(192.168.20.10)의 통신을 복구하세요. R1–R2 연결은 10.0.0.0/30입니다. 정적 라우팅을 사용하고 수정 전후 및 양방향 검증 결과를 남기세요.'},{name:'R1·R2 초기 설정',kind:'설정 자료',body:'R1: 192.168.20.0/24 → 10.0.0.2\nR2: 192.168.10.0/24 → 10.0.0.9\nR1 인터페이스: 10.0.0.1\nR2 인터페이스: 10.0.0.2\n실습용 가상 설정입니다. 실제 장비 연결은 없습니다.'},{name:'수정 전 Ping 결과',kind:'검증 기록',body:'14:10 · 윤서준\n본사 → 지사\nSent = 4, Received = 0, Lost = 4 (100% loss)\n다음 확인: 양쪽 라우팅 테이블과 다음 홉 비교'}]}
studentInitial.resources.push(
 {name:'장애 진단 보고서 초안',kind:'팀 문서',author:'장시우',updated:'오늘 14:12',version:3,body:'1. 장애 현상\n본사와 지사 사이 통신 실패\n\n2. 원인 후보\n반환 경로의 다음 홉과 인터페이스 상태 비교\n\n3. 다음 작업\n설정 변경 이유와 양방향 결과를 추가합니다.'},
 {name:'1팀 회의록 · 역할과 확인 순서',kind:'팀 문서',author:'김민준',updated:'오늘 13:55',version:2,body:'김민준: R1 경로 분석\n유송민: R2 설정 및 검증\n장시우: 보고서 정리\n윤서준: 수정 전후 결과 교차 확인\n\n합의: 설정은 한 번에 한 항목씩 변경하고 근거를 기록합니다.'},
 {name:'검증 체크리스트',kind:'검증 기록',author:'윤서준',updated:'오늘 14:09',version:1,body:'□ 수정 전 실패 결과 확보\n□ 본사 → 지사 Ping\n□ 지사 → 본사 Ping\n□ 동일 조건으로 결과 비교\n□ 판단 근거 작성'},
 {name:'네트워크 주소 정리',kind:'팀 문서',author:'유송민',updated:'오늘 14:01',version:1,body:'본사: 192.168.10.0/24\n지사: 192.168.20.0/24\n라우터 연결: 10.0.0.0/30\n\n각 대역과 다음 홉이 실제 연결과 일치하는지 확인합니다.'}
)
studentInitial.resources.push(...structuredClone(demoSources.network))
studentInitial.resourceSchema=3

export function readStudent():StudentState {try{const s=JSON.parse(localStorage.getItem('trace-student-yusongmin-v1')||'null');if(s&&Array.isArray(s.teamMessages)&&Array.isArray(s.privateMessages)&&Array.isArray(s.resources)&&Array.isArray(s.checks))return {...structuredClone(studentInitial),...s,resourceSchema:2,resources:s.resourceSchema===2?s.resources:[...s.resources,...studentInitial.resources.filter(r=>!s.resources.some((existing:TeamResource)=>existing.name===r.name))]}}catch{/* 로컬 데모 기본값 사용. */}return structuredClone(studentInitial)}
export const guidanceLevels=['확인 질문','탐색 방향 안내','개념 힌트','도구 활용 힌트']
export function guidanceReply(level:number,verified:boolean){return verified?'양방향 검증 결과가 모였네요. 수정 전 실패와 수정 후 성공을 비교하면, 원인 가설을 어떻게 설명할 수 있을까요? 성공하지 않을 수 있는 다른 조건도 하나 남겨 보세요.':[
'지금까지 직접 확인한 사실은 무엇인가요? 응답이 있는 구간과 없는 구간을 구분하고, 다음 확인으로 무엇을 알아내고 싶은지 적어 보세요.',
'본사에서 지사로 가는 경로와 돌아오는 경로를 나누어 살펴보세요. 두 라우터의 목적지 대역과 다음 홉 중 어느 항목이 실제 연결과 다른가요?',
'Ping 응답에는 요청과 응답의 두 경로가 모두 필요합니다. 정적 경로의 다음 홉은 인접 장비의 주소여야 합니다. 지금 설정한 다음 홉에 실제로 도달할 수 있나요?',
'R1과 R2에서 show ip route를 실행해 목적지와 다음 홉을 비교해 보세요. 변경 뒤에는 PC-A와 PC-B 각각에서 ping을 실행하고 수정 전 결과와 비교해 보세요.'
][level-1]}

// ponytail: 고정 규칙 기반 데모 분류. 서비스 전환 시 맥락 기반 AI 정책 판단으로 교체.
export function selectGuidanceLevel(question:string,verified:boolean):number {
  if(verified)return 1
  if(/명령|도구|어떻게 실행|ping|show ip/i.test(question))return 4
  if(/왜|개념|의미|원리|무슨|이해/.test(question))return 3
  if(/어디|어느|범위|비교|막|모르/.test(question))return 2
  return 1
}
export function readStudentGuidanceSummary(){const d=readStudent();return guidanceLevels.map((name,i)=>({name,level:i+1,count:d.privateMessages.filter(m=>m.author==='AI'&&m.level===i+1).length}))}
