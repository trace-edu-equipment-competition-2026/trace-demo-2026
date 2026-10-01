import {test,expect} from '@playwright/test'
import {scenarios} from '../src/scenarios'
import {supportFor,applyPolicy,nextSituation,applySituation} from '../src/learningLoop'
test('수행 실패·성공과 교수자 범위에 따라 지원을 조절하고 조건을 초기화한다',()=>{
 const s=scenarios.network,d=structuredClone(s.project)
 d.assignment={...structuredClone(s.assignment),mode:'AI 자동',intervention:'적극',guidance:{...s.assignment.guidance,'AI 자동':['확인 질문','탐색 방향 안내','개념 힌트','도구 활용 힌트']}}
 d.simulation={target:'PC-A',rules:[true,true],checks:{'본사 → 지사':false},lines:['100% loss'],note:''}
 expect(supportFor('다음은?',d,s)?.level).toBe(4)
 d.experiment=true;expect(supportFor('어떤 명령?',d,s)?.level).toBe(1)
 d.assignment.guidance['AI 자동']=['확인 질문'];d.experiment=false;expect(supportFor('어떤 명령?',d,s)?.level).toBe(1)
 d.assignment.guidance['AI 자동']=['지원하지 않는 사용자 정의'];expect(supportFor('다음은?',d,s)).toBeNull()
 d.experiment=true;const next=nextSituation(d,s)!;const changed=applySituation(d,next);expect(changed.experiment).toBe(false);expect(changed.simulation).toBeUndefined();expect(changed.evidence).toEqual(d.evidence)
 d.supports=[{id:'pending',text:'검토 전',topic:'확인',level:1,reason:'사유',status:'pending',time:'지금'}];expect(applyPolicy(d,s.assignment).supports?.[0].status).toBe('rejected')
 const f=scenarios.fusion,fd=structuredClone(f.project);fd.experiment=true;fd.assignment={...structuredClone(f.assignment),situations:['사용자 피드백']};expect(nextSituation(fd,f)).toBeNull();d.assignment.situations=['사용자 피드백'];expect(nextSituation(d,s)).toBeNull();d.assignment.situations=['오류·장애'];d.situation={...next,status:'complete'};expect(nextSituation(d,s)).toBeNull();expect(supportFor('API?',fd,f)?.level).toBe(1)
})
