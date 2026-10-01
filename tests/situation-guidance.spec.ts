import {test,expect,type Page} from '@playwright/test'
import {scenarios,readProject,scenarioEvidence} from '../src/scenarios'
import {supportFor,nextSituation,applySituation,assessSituation} from '../src/learningLoop'
async function role(p:Page,student:boolean){await p.getByRole('button',{name:'프로필 전환',exact:true}).click();await p.getByRole('button',{name:student?/유송민 학생/:/강병준 교수자/}).click()}
async function nav(p:Page,name:string){const b=p.getByRole('button',{name:'수업 메뉴 열기',exact:true});if(await b.isVisible()&&!await p.locator('.sidebar.open').count())await b.click();await p.locator('.sidebar nav').getByRole('button',{name,exact:true}).click()}
test('승인은 추가 선행·심화 상황에만 필요하고 기존 근거를 보존한다',()=>{
 for(const s of Object.values(scenarios)){
  const d=structuredClone(s.project);d.assignment=structuredClone(s.assignment)
  for(const q of ['역할 분담','프로젝트 구현 방법과 검증을 상의하고 싶어요','자료 조사 방법이 궁금해요'])expect(supportFor(q,d,s,'team')?.status).toBe('approved')
  const support=supportFor('프로젝트 구현 방법을 상의하고 싶어요',d,s,'team')!
  expect(support.topic).toBe('프로젝트 논의');expect(support.text).toContain(s.id==='network'?'조사 노트':'응답계약')
  expect(nextSituation(d,s)).toBeNull();d.student.teamMessages.push({author:'유송민',text:s.id==='network'?'다음 홉과 경로 개념을 모르겠어요. 계속 막혀요.':'화면과 API 연결 개념을 모르겠어요. 계속 막혀요.',time:'현재'})
  const prep=nextSituation(d,s)!;expect(prep).toMatchObject({status:'pending',purpose:'선행 단계 추가',original:s.assignment.description});expect(prep.sourceIds?.length).toBeGreaterThan(0)
  d.situation=prep;expect(nextSituation(d,s)).toBeNull();const changed=applySituation(d,prep);expect(changed.evidence).toEqual(d.evidence);expect(changed.student.resources).toEqual(d.student.resources)
  d.situation=undefined;d.student.teamMessages=s.project.student.teamMessages;d.experiment=true;expect(nextSituation(d,s)).toMatchObject({status:'pending',purpose:'심화 조건 추가'})
  d.assignment.mode='AI 자동';expect(nextSituation(d,s)?.status).toBe('active')
 }
})
test('기존 로컬 문서를 보존하며 조사 원본을 보강하고 자기 설명을 원자료로 복사하지 않는다',()=>{
 const saved=structuredClone(scenarios.network.project);saved.student.resourceSchema=2;saved.student.resources=[{name:'내 문서',kind:'팀 문서',body:'보존할 사용자 내용'}];saved.evidence.push({title:'사용자 자기 설명',detail:'조사했다고 적음',owner:'유송민',source:'내 입력',criterion:'해결 과정',time:'현재'})
 const key='trace-project-network-v2';Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>k===key?JSON.stringify(saved):null}})
 try{const upgraded=readProject('network');expect(upgraded.student.resources[0].body).toBe('보존할 사용자 내용');expect(upgraded.student.resources.some(r=>r.id==='routing-research')).toBe(true);expect(upgraded.student.resourceSchema).toBe(3)
 const evidence=scenarioEvidence(scenarios.network,'유송민','네트워크 설정·검증',1,false,upgraded).evidence;expect(evidence.find(e=>e.title==='사용자 자기 설명')?.raw).toContain('연결된 원자료 없음');expect(evidence.find(e=>e.title==='주소와 경로 비교')?.raw).toContain('정적 경로 조사 노트.txt')
 }finally{Reflect.deleteProperty(globalThis,'localStorage')}
})
test('선행 상황은 승인 전 숨기고 승인 후에만 적용하며 일반 가이던스는 계속 제공한다',async({page})=>{
 await page.goto('/');await role(page,true);await nav(page,'팀 채팅');await page.getByRole('button',{name:'프로젝트 해결 방향과 검증 방법을 상의하고 싶어요',exact:true}).click();await page.getByRole('button',{name:'AI 가이던스 요청',exact:true}).click();await expect(page.locator('.ai-guidance')).toContainText('조사 노트')
 await page.getByLabel('팀 메시지',{exact:true}).fill('다음 홉과 경로 개념을 모르겠어요. 계속 막혀요.');await page.getByRole('button',{name:'AI 가이던스 요청',exact:true}).click();await nav(page,'프로젝트 작업실');await expect(page.getByLabel('추가할 문제 상황')).toHaveCount(0);await expect(page.getByRole('button',{name:'다음 상황 제안',exact:true})).toHaveCount(0);await expect(page.locator('main')).toContainText('승인 전이므로');await expect(page.locator('.situation-conditions')).toHaveCount(0)
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-network-v2')!));expect(saved.situation.status).toBe('pending');expect(saved.completed).toContain('schema')
 await role(page,false);await nav(page,'수업 대시보드');await expect(page.locator('.intervention-table')).toContainText('추가 문제 상황 1건 승인 대기');await page.getByRole('button',{name:'추가 상황 검토 →',exact:true}).click()
 await expect(page.locator('.situation-conditions')).toContainText('선행 단계 추가');await page.getByText('AI 판단에 사용한 채팅·학습 증거 1개',{exact:true}).click();await expect(page.locator('.situation-sources').first()).toContainText('계속 막혀요');await page.getByText('제안에 연결된 조사·수행 원자료 2개',{exact:true}).click();await expect(page.locator('.situation-sources').last()).toContainText('R2# show running-config')
 for(const [width,height] of [[1440,1080],[1180,820],[820,1180]]){await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('.learning-loop').filter({has:page.getByRole('heading',{name:'추가 문제 상황 승인',exact:true})}).screenshot({path:`.impeccable/review/situation-approval-${width}.png`})}
 await page.setViewportSize({width:1440,height:1080});await page.getByLabel('적용할 변경 상황').fill('정적 경로의 다음 홉을 조사하고 현재 설정과 비교표를 작성하세요.');await page.getByRole('button',{name:'변경 상황 승인·적용',exact:true}).click()
 await role(page,true);await nav(page,'프로젝트 작업실');await expect(page.locator('.situation-conditions')).toContainText('비교표를 작성하세요');await expect(page.locator('main')).toContainText('강병준 교수자 승인');await page.getByRole('button',{name:'실행 및 검증',exact:true}).click();await expect(page.locator('.fusion-test-checks')).toBeVisible();await expect(page.locator('.fusion-test-checks')).not.toContainText('추가 단말 PC-C')
 saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-network-v2')!));expect(saved.situation.status).toBe('active');expect(saved.situation.reviewedBy).toBe('강병준 교수자');expect(saved.evidence).toHaveLength(2)
 await page.reload();await role(page,true);await nav(page,'프로젝트 작업실');await expect(page.locator('.situation-conditions')).toContainText('비교표를 작성하세요')
})
test('문제 상황 거절은 기존 과제를 유지하고 첨부 조사 문서는 원문이 보인다',async({page})=>{
 await page.goto('/');await role(page,true);await nav(page,'팀 채팅');await page.getByLabel('팀 메시지',{exact:true}).fill('다음 홉과 경로 개념을 모르겠어요. 계속 막혀요.');await page.getByRole('button',{name:'팀에 보내기',exact:true}).click();await role(page,false);await nav(page,'팀별 모니터링');await page.locator('.stage-map-row').first().click();await page.getByRole('button',{name:'변경 상황 거절',exact:true}).click()
 await role(page,true);await nav(page,'프로젝트 작업실');await expect(page.locator('main')).toContainText('원래 과제를 계속 수행하세요');const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-network-v2')!));expect(saved.completed).toEqual(['problem','schema']);expect(saved.situation.status).toBe('rejected')
 await nav(page,'팀 자료');await page.locator('input[type=file]').setInputFiles({name:'조사_원본.txt',mimeType:'text/plain',buffer:Buffer.from('내가 직접 조사한 원문\n대안 A와 B의 비교 결과')});await page.getByRole('button',{name:/조사_원본.txt 첨부 파일/}).click();await expect(page.getByRole('dialog')).toContainText('대안 A와 B의 비교 결과');await expect(page.getByRole('dialog')).toContainText('학생이 첨부한 원본 파일')
 await page.screenshot({path:'.impeccable/review/upload-source-1440.png'})
})

 test('자동형은 새 수행 실패 근거에서 선행 단계를 적용하고 가벼운 질문에는 조건을 추가하지 않는다',()=>{
 const s=scenarios.fusion,previous=structuredClone(s.project);previous.assignment={...structuredClone(s.assignment),mode:'AI 자동'}
 const light=structuredClone(previous);light.student.teamMessages.push({author:'유송민',text:'API와 화면 중 어디에서 출처를 검사할까요?',time:'현재'});expect(assessSituation(light,s,previous).situation).toBeUndefined()
 const failed=structuredClone(previous);failed.evidence.push({id:'new',title:'새 테스트 로그',raw:'T02,expected:not_found,observed:ok,FAIL',detail:'출처가 비었는데 답변을 표시했다.',kind:'record',stage:3,owner:'유송민',source:'학생 공유',criterion:'검증',time:'현재'});failed.alternative={evidenceId:'new',status:'pending'}
 const assessed=assessSituation(failed,s,previous);expect(assessed.situation).toMatchObject({status:'active',purpose:'선행 단계 추가',origin:'AI'});expect(assessed.situation?.basis?.[0].raw).toContain('FAIL');expect(assessed.evidence).toEqual(failed.evidence);expect(assessSituation(assessed,s,failed).situation?.id).toBe(assessed.situation?.id)
 previous.assignment!.mode='교수자 직접';expect(assessSituation({...failed,assignment:previous.assignment},s,previous).situation).toBeUndefined()
 })
 test('자동형은 학생 선택 없이 채팅에서 추가 상황을 적용하고 성공 기록에서는 심화를 판단한다',async({page})=>{
 const s=scenarios.fusion,d=structuredClone(s.project);d.assignment={...structuredClone(s.assignment),mode:'AI 자동'}
 await page.goto('/');await page.evaluate(data=>localStorage.setItem('trace-project-fusion-v2',JSON.stringify(data)),d);await page.reload();await page.getByRole('button',{name:'워크스페이스 전환',exact:true}).click();await page.locator('.dropdown-option').filter({hasText:'융합 팀 프로젝트'}).click();await role(page,true);await nav(page,'팀 채팅')
 await page.getByLabel('팀 메시지',{exact:true}).fill('화면과 API 연결 개념을 모르겠어요. 계속 막혀요.');await page.getByRole('button',{name:'팀에 보내기',exact:true}).click();await nav(page,'프로젝트 작업실');await expect(page.locator('.situation-conditions')).toContainText('선행 단계 추가');await expect(page.getByRole('button',{name:'다음 상황 제안',exact:true})).toHaveCount(0)
 const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-fusion-v2')!));expect(first.situation.status).toBe('active');expect(first.situation.origin).toBe('AI')
 const successful=structuredClone(d);successful.evidence.push({id:'success',title:'새 성공 결과',raw:'T01,expected:source,observed:source,PASS',detail:'정상 입력 결과를 확인했다.',kind:'record',stage:3,owner:'유송민',source:'학생 공유',criterion:'검증',time:'현재'})
 await page.evaluate(data=>localStorage.setItem('trace-project-fusion-v2',JSON.stringify(data)),successful);await page.reload();await page.getByRole('button',{name:'워크스페이스 전환',exact:true}).click();await page.locator('.dropdown-option').filter({hasText:'융합 팀 프로젝트'}).click();await role(page,true);await nav(page,'프로젝트 작업실');await expect(page.locator('.situation-conditions')).toContainText('심화 조건 추가');const last=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-fusion-v2')!));expect(last.situation.status).toBe('active')
 })
