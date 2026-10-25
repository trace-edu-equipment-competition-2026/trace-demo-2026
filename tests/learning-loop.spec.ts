import {test,expect,type Page} from '@playwright/test'
async function nav(p:Page,name:string){const b=p.getByRole('button',{name:'수업 메뉴 열기',exact:true});if(await b.isVisible()&&!await p.locator('.sidebar.open').count())await b.click();await p.locator('.sidebar nav').getByRole('button',{name,exact:true}).click()}
async function role(p:Page,student:boolean){const b=p.getByRole('button',{name:'수업 메뉴 열기',exact:true});if(await b.isVisible()&&!await p.locator('.sidebar.open').count())await b.click();await p.getByRole('button',{name:'프로필 전환',exact:true}).click();await p.getByRole('button',{name:student?/유송민 학생/:/강병준 교수자/}).click()}
async function fusion(p:Page){await p.getByRole('button',{name:'워크스페이스 전환',exact:true}).click();await p.locator('.dropdown-option').filter({hasText:'융합 팀 프로젝트'}).click()}
async function teamOne(p:Page){await nav(p,'팀별 모니터링');await p.locator('.stage-map-row').first().click()}
async function execute(p:Page){await nav(p,'프로젝트 작업실');await p.getByRole('button',{name:'실행 및 검증',exact:true}).click()}
async function fusionChecks(p:Page){await p.getByLabel('수행 방법과 도구 선택 이유').fill('React 화면에서 고정 JSON 응답 비교');await p.getByLabel('산출물·검증 조건·관찰 결과').fill('results.json / 출처 있음: 출처 표시, 출처 없음: 답변 보류');await p.getByLabel('결과 해석과 목표 충족 설명').fill('출처 유무에 따라 표시가 달라지는 것을 확인했다.');await p.getByRole('button',{name:'수행자료 검토 요청',exact:true}).click()}

test('저장된 교수자 정책이 학생 지원의 상한과 학습 목표에 적용된다',async({page})=>{
 await page.goto('/');await nav(page,'프로젝트 · 과제 생성');await page.getByRole('button',{name:'AI 운영 방식 설정',exact:true}).click();await page.getByRole('tab',{name:'AI 자동',exact:true}).click()
 for(const name of ['탐색 방향 안내','개념 힌트'])await page.locator('.guidance-field').getByRole('button',{name,exact:true}).click()
 await page.getByRole('button',{name:'학생 화면 미리보기',exact:true}).click();await page.getByRole('button',{name:'과제 생성',exact:true}).click()
 await role(page,true);await nav(page,'개인 AI 지원');await page.getByLabel('개인 질문').fill('어떤 명령으로 실행하나요?');await page.getByRole('button',{name:'AI에게 질문하기'}).click()
 await expect(page.getByRole('log')).toContainText('지금까지 직접 확인한 사실');await expect(page.getByRole('log')).not.toContainText('show ip route')
 const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-network-v2')!));expect(record.supports.at(-1).level).toBe(1);expect(record.assignment.mode).toBe('AI 자동')
 await page.reload();await role(page,true);await nav(page,'개인 AI 지원');await expect(page.locator('main')).toContainText('AI 자동 / 보통 개입')
})

test('승인형에서도 힌트를 바로 제공하고 학생의 명시적 제안 거부 기록만 공유한다',async({page})=>{
 test.setTimeout(90000);await page.goto('/');await role(page,true);await nav(page,'개인 AI 지원')
 const before=await page.locator('.student-message').count();await page.getByLabel('개인 질문').fill('내 개인적인 질문 원문 98765 어느 구간일까요?');await page.getByRole('button',{name:'AI에게 질문하기'}).click();await expect(page.locator('.student-message')).toHaveCount(before+2)
 await role(page,false);await teamOne(page);await expect(page.locator('main')).not.toContainText('98765');await expect(page.getByRole('button',{name:'힌트 승인·전달'})).toHaveCount(0)
 await role(page,true);await nav(page,'개인 AI 지원');await expect(page.getByRole('log')).toContainText('본사에서 지사로 가는 경로와 돌아오는 경로')
 await page.getByRole('button',{name:'수행·판단 기록 열기',exact:true}).last().click();await page.getByRole('button',{name:'AI 제안 판단',exact:true}).click();await page.getByLabel('나의 판단',{exact:true}).selectOption('거부');await page.getByLabel('채택·수정·거부한 이유').fill('현재 자료로 경로 문제를 단정할 수 없어 인터페이스부터 확인한다.');await page.getByLabel('내가 선택한 접근과 확인 방법').fill('인터페이스 상태를 먼저 비교하고 그 다음 경로를 확인한다.');await page.getByRole('button',{name:'판단 근거 교수자에게 공유'}).click()
 for(const [width,height] of [[1440,1080],[1180,820],[820,1180],[390,844]]){await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);document.getAnimations().forEach(a=>a.finish())});await page.screenshot({path:`.impeccable/review/learning-support-${width}.png`,fullPage:true})}
 await page.setViewportSize({width:1440,height:1080});await role(page,false);await nav(page,'학생별 평가 지원');await page.getByLabel('학생 선택').selectOption('유송민');await page.locator('.evidence-list button').filter({hasText:'AI 제안 검토 · 거부'}).click();await expect(page.locator('.source-layer')).toContainText('본사에서 지사로 가는 경로');await expect(page.locator('.student-layer')).toContainText('단정할 수 없어');await expect(page.locator('main')).not.toContainText('98765')
 await page.getByRole('button',{name:/가이던스 이력/}).click();await page.locator('.guidance-events button').last().click();await expect(page.locator('.guidance-sequence')).toContainText('판단: 거부')
})

test('융합은 실습 폼 없이 자료를 제출하고 교수자 확인 후 다음 회차로 이어진다',async({page})=>{
 await page.goto('/');await fusion(page);await role(page,true);await execute(page)
 await expect(page.locator('.alternative-outcome')).toHaveCount(0);await expect(page.getByLabel('명령·요청')).toHaveCount(0);await expect(page.getByRole('button',{name:/TEST /})).toHaveCount(0)
 await fusionChecks(page);await expect(page.getByRole('button',{name:'다음 상황 제안',exact:true})).toHaveCount(0)
 await role(page,false);await teamOne(page);await expect(page.locator('main')).toContainText('results.json');await page.getByRole('button',{name:'수행자료의 목표 충족 확인'}).click()
 await role(page,true);await execute(page);await expect(page.locator('main')).toContainText('교수자 검토 대기')
 await role(page,false);await teamOne(page);await page.getByRole('button',{name:'변경 상황 승인·적용'}).click()
 await role(page,true);await execute(page);await expect(page.getByLabel('수행 방법과 도구 선택 이유')).toBeEmpty();await page.getByLabel('변경 조건의 영향·대안 비교·팀 역할 합의').fill('외부 API 없이 공개 문서 조회로 변경하고 팀별 검증 역할을 합의했다.');await page.getByRole('button',{name:'재분석과 팀 합의 저장'}).click();await fusionChecks(page)
 await role(page,false);await teamOne(page);await page.getByRole('button',{name:'수행자료의 목표 충족 확인'}).click()
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-fusion-v2')!));const records=saved.evidence.filter((e:{title:string})=>e.title==='프로젝트 수행자료와 검증 기록');expect(records).toHaveLength(2);expect(records.map((e:{cycle:number})=>e.cycle)).toEqual([0,1]);expect(saved.situation.status).toBe('complete');expect(saved.student.resources.filter((r:{kind:string})=>r.kind==='Learning Evidence')).toHaveLength(2)
 await page.reload();await fusion(page);await role(page,true);await execute(page);await expect(page.locator('.alternative-outcome')).toContainText('목표 충족을 확인했습니다')
 for(const [width,height] of [[1440,1080],[1024,768],[768,1024]]){await page.setViewportSize({width,height});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`.impeccable/review/fusion-no-form-${width}.png`})}
})

test('다른 접근은 근거 제출과 교수자 확인을 거쳐 인정한다',async({page})=>{
 await page.goto('/');await role(page,true);await execute(page);await expect(page.getByRole('button',{name:'ip route 192.168.10.0 255.255.255.0 10.0.0.1',exact:true})).toHaveCount(0)
 await page.getByText('다른 해결 방법으로 수행했나요?',{exact:true}).click();await page.getByLabel('대안 접근과 선택 이유').fill('외부 실습 도구에서 같은 정적 라우팅 목표를 검증했다.');await page.getByLabel('외부 원자료·자료명·실행 조건').fill('external-log.txt / 두 단말 왕복 4/4 / 변경 전후 동일 조건');await page.getByLabel('결과 해석과 목표 충족 설명').fill('양방향 경로와 결과를 확인했으며 설정 파일은 팀 자료로 제출한다.');await page.getByRole('button',{name:'대안 수행자료 검토 요청'}).click()
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-network-v2')!));expect(saved.experiment).toBe(false)
 await role(page,false);await teamOne(page);await expect(page.locator('main')).toContainText('external-log.txt');await page.getByRole('button',{name:'대안의 추가 자료 요청'}).click();await role(page,true);await execute(page);await expect(page.locator('.alternative-outcome')).toContainText('추가 자료를 요청했습니다');await page.getByText('다른 해결 방법으로 수행했나요?',{exact:true}).click();await page.getByLabel('대안 접근과 선택 이유').fill('동일한 두 단말과 정적 경로를 외부 도구로 비교했다.');await page.getByLabel('외부 원자료·자료명·실행 조건').fill('external-log-v2.txt / 변경 전 0/4, 변경 후 양방향 4/4');await page.getByLabel('결과 해석과 목표 충족 설명').fill('같은 조건에서 수정 전후 결과가 달라졌다.');await page.getByRole('button',{name:'대안 수행자료 검토 요청'}).click();await role(page,false);await teamOne(page);await page.getByRole('button',{name:'대안의 목표 충족 확인'}).click();saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-network-v2')!));expect(saved.experiment).toBe(true);expect(saved.alternative.status).toBe('accepted');await role(page,true);await execute(page);await expect(page.locator('.alternative-outcome')).toContainText('목표 충족을 확인했습니다');await page.getByText('제출한 근거와 설명 보기',{exact:true}).click();for(const width of [1440,820]){await page.setViewportSize({width,height:1080});await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);document.getAnimations().forEach(a=>a.finish())});await page.screenshot({path:`.impeccable/review/learning-alternative-${width}.png`,fullPage:true})}
})

test('네트워크 추가 단말은 새 경로를 직접 수정하고 재검증해야 한다',async({page})=>{
 await page.goto('/');await role(page,true);await execute(page)
 const command=async(target:string,input:string)=>{await page.getByLabel('실행 대상',{exact:true}).selectOption(target);await page.getByLabel('명령·요청',{exact:true}).fill(input);await page.getByRole('button',{name:'실행',exact:true}).click()}
 await page.getByLabel('수정 전 실패 결과를 비교 기준으로 사용').check();await page.getByLabel('반대 방향의 결과까지 확인').check()
 await command('R2','ip route 192.168.10.0 255.255.255.0 10.0.0.1');await command('PC-A','ping 192.168.20.10');await command('PC-B','ping 192.168.10.10');await page.getByLabel('어떤 근거로 판단했고, 무엇을 더 확인해야 하나요?').fill('두 단말 왕복 결과 확인');await page.getByRole('button',{name:'검증 근거 팀에 공유'}).click()
 await expect(page.locator('main')).toContainText('교수자 검토 대기');await role(page,false);await teamOne(page);await page.getByRole('button',{name:'변경 상황 승인·적용'}).click();await role(page,true);await execute(page)
 await page.getByLabel('변경 조건의 영향·대안 비교·팀 역할 합의').fill('PC-C의 추가 대역 경로를 확인하고 두 기존 단말도 함께 재검증한다.');await page.getByRole('button',{name:'재분석과 팀 합의 저장'}).click()
 await page.getByLabel('수정 전 실패 결과를 비교 기준으로 사용').check();await page.getByLabel('반대 방향의 결과까지 확인').check()
 await command('PC-A','ping 192.168.30.10');await expect(page.getByRole('log')).toContainText('100% loss')
 await command('R1','show ip route');await expect(page.getByRole('log')).toContainText('경로 없음');await command('R1','ip route 192.168.30.0 255.255.255.0 10.0.0.2')
 await command('PC-A','ping 192.168.20.10');await command('PC-B','ping 192.168.10.10');await command('PC-A','ping 192.168.30.10');await page.getByLabel('어떤 근거로 판단했고, 무엇을 더 확인해야 하나요?').fill('추가 대역 경로와 기존 두 단말을 함께 확인');await page.getByRole('button',{name:'검증 근거 팀에 공유'}).click()
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-network-v2')!));expect(saved.situation.status).toBe('complete');expect(saved.evidence.filter((e:{stage:number})=>e.stage===3)).toHaveLength(2)
 await page.getByLabel('반대 방향의 결과까지 확인').uncheck();saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trace-project-network-v2')!));expect(saved.experiment).toBe(false);expect(saved.situation.status).toBe('active');expect(saved.evidence.filter((e:{stage:number})=>e.stage===3)).toHaveLength(2);await expect(page.getByRole('button',{name:'검증 근거 팀에 공유'})).toBeDisabled()
})
