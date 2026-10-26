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

// 7분 시연 수업 대시보드(화면 A) 및 과제 설계(화면 B)용 시나리오별 요약 데이터.
export const demoLessonOverview = {
  network: {
    badge: '2026학년도 2학기 · 가상 수업 예시',
    gradeLabel: '고등학교 2학년',
    lessonTitle: '정적 라우팅 장애의 원인 분석과 복구',
    classContext: '직업계고 정보통신과 · 2학년 2반 · 컴퓨터 네트워크',
    semester: '2026학년도 2학기',
    classGroup: '정보통신과 2학년 2반',
    subject: '컴퓨터 네트워크',
    progressWeek: '8주차',
    completedSessions: '15/24',
    progressDetail: '8주차 · 15/24차시 완료',
    taskMode: '개인 실습',
    prerequisite: 'IP 주소, 서브넷, 게이트웨이, 라우터의 역할',
    objective: '통신 장애의 증거를 수집하고, 라우팅 테이블을 분석하여 수정·검증하기',
    previousLesson: '라우터의 역할과 정적 라우팅',
    currentLesson: '라우팅 장애 진단과 복구',
    nextLesson: '장애 원인 설명과 재발 방지',
    disclaimer: '학년·반·8주차·차시 배치는 실제 학교 편성표가 아닌 시연을 위한 가상 수업 설정입니다.',
    curriculumBasis: '2022 개정 교육과정 정보·통신 전문 교과(컴퓨터 네트워크 · 네트워크 구축) 라우팅 성취기준',
    optionalNcsBasis: 'NCS 네트워크구축 직무 능력단위 (교수자 선택 적용)',
    proposalTitle: '본사–지사 네트워크 통신 장애 복구',
    proposalSummary:
      '학생은 정상 동작해야 할 네트워크를 분석하고, 라우팅 설정 오류를 진단한 후 통신을 복구해야 합니다. 변경 전후의 결과와 판단 이유를 기록합니다.',
    briefingSummary:
      '사전 준비된 교안·실습 참고자료 요약: 본사(192.168.10.0/24)–지사(192.168.20.0/24) 정적 라우팅 구간에서 반환 경로 Next Hop 오설정으로 인한 단방향/양방향 불통 사례를 진단합니다.',
  },
  fusion: {
    badge: '2026학년도 2학기 · 융합 프로젝트 예시',
    gradeLabel: '전공 융합 트랙',
    lessonTitle: '신입생 안내 챗봇 근거 검증과 응답 보류 규칙 설계',
    classContext: '컴퓨터·데이터·디자인 융합 · 6팀 24명 · AI·웹 융합 캡스톤',
    semester: '2026학년도 2학기',
    classGroup: '융합 캡스톤 A반',
    subject: 'AI·웹 융합 캡스톤',
    progressWeek: '8주차',
    completedSessions: '15/24',
    progressDetail: '8주차 · 15/24차시 완료',
    taskMode: '팀 프로젝트',
    prerequisite: '응답 스키마(JSON), 출처 ID 연결, 조건 분기 화면 설계',
    objective: '자료가 없는 질문에 대한 답변 보류 규칙을 구현하고 경계 조건을 검증하기',
    previousLesson: '고정 안내문 데이터와 응답 계약 정의',
    currentLesson: '근거 없는 답변 보류 분기와 모의 검증',
    nextLesson: '팀 간 교차 검증과 한계 정리',
    disclaimer: '융합 트랙은 투트랙 비교를 위한 시연용 프로젝트 설정입니다.',
    curriculumBasis: '교과 성취기준 기반 문제 정의·근거 기반 설계·검증',
    optionalNcsBasis: 'SW·데이터 직무 능력단위 (교수자 선택 적용)',
    proposalTitle: '신입생 안내 챗봇 근거 기반 답변 보류 검증',
    proposalSummary:
      '학생은 고정 안내문 데이터에 근거가 있는 질문과 없는 질문을 비교하고, 출처가 없을 때 답변을 보류하는 화면·응답 규칙을 구현·검증합니다.',
    briefingSummary:
      '사전 준비된 프로젝트 참고자료 요약: 등록 질문(T01)과 미등록 질문(T02)의 source_ids 유무를 비교하여 근거 없는 답변 생성을 차단합니다.',
  },
} as const
