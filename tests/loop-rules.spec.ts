import {test,expect} from '@playwright/test'
import {scenarios} from '../src/domain/scenarios'
import {supportFor,applyPolicy,nextSituation,applySituation} from '../src/domain/learningLoop'
import {executeSimulationCommand,getSimulationConfig} from '../src/domain/simulationEngine'
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
 const cfg=getSimulationConfig(true,false),baseCtx={isNetwork:true,extended:false,target:'R2',rules:[true,true],checks:{},student:structuredClone(s.project.student),extensionFixed:false,conditions:cfg.conditions}
 expect(executeSimulationCommand('show ip route',baseCtx)?.output).toContain('10.0.0.9')
 expect(executeSimulationCommand('show running-config',baseCtx)?.output).toContain('ip route 192.168.10.0 255.255.255.0 10.0.0.9')
 expect(executeSimulationCommand('ping 192.168.10.1',{...baseCtx,target:'PC-A'})?.output).toContain('4/4')
 expect(executeSimulationCommand('traceroute 192.168.20.10',{...baseCtx,target:'PC-A'})?.output).toContain('Request timed out')
 const fixed=executeSimulationCommand('ip route 192.168.10.0 255.255.255.0 10.0.0.1',baseCtx)!
 expect(fixed.student.routeFixed).toBe(true)
 expect(executeSimulationCommand('ping 192.168.20.10',{...baseCtx,target:'PC-A',student:fixed.student})?.output).toContain('4/4')
 expect(executeSimulationCommand('traceroute 192.168.20.10',{...baseCtx,target:'PC-A',student:fixed.student})?.output).toContain('192.168.20.10')
 const fresh=structuredClone(s.project)
 const directAsk=supportFor('통신이 안 되는데 정답이 뭔가요? 설정 명령어 알려주세요.',fresh,s,'private')!
 expect(directAsk.level).toBe(1)
 expect(directAsk.text).toContain('기본 게이트웨이(192.168.10.1)까지 통신이 가능한지')
 const tableAsk=supportFor('PC-A에서 R1까지 Ping은 성공하지만 PC-B까지는 실패합니다. R1과 R2 중 어느 장비의 라우팅 테이블을 먼저 확인하는 것이 좋을까요?',fresh,s,'private')!
 expect(tableAsk.level).toBe(2)
 expect(tableAsk.text).toContain('본사에서 지사로 가는 경로와 돌아오는 경로')
})
