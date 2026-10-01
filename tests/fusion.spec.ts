import {test,expect,type Page} from '@playwright/test'
async function menu(p:Page){const b=p.getByRole('button',{name:'수업 메뉴 열기',exact:true});if(await b.isVisible() && !(await p.locator(".sidebar.open").count()))await b.click()}
async function nav(p:Page,name:string){await menu(p);await p.locator('.sidebar nav').getByRole('button',{name,exact:true}).click()}
async function workspace(p:Page,id:'network'|'fusion'){await menu(p);await p.getByRole('button',{name:'워크스페이스 전환',exact:true}).click();await p.locator('.dropdown-option').filter({hasText:id==='network'?'2학년 네트워크 실습':'융합 팀 프로젝트'}).click()}
async function role(p:Page,student:boolean){await menu(p);await p.getByRole('button',{name:'프로필 전환',exact:true}).click();await p.getByRole('button',{name:student?/유송민 학생/:/강병준 교수자/}).click()}
async function signature(p:Page){return {nav:await p.locator('.sidebar nav button').allTextContents(),panels:await p.locator('main .panel').count(),headings:await p.locator('main .section-heading h2').allTextContents(),layout:await p.locator('.sidebar,.main').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.width)]}))}}
test('두 워크스페이스의 모든 메뉴·카드·하위 화면이 동일한 규격을 사용한다',async({page})=>{
 test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/')
 const compare=async(label:string)=>{await expect(page.locator('.fusion-knowledge,.assignment-knowledge')).toHaveCount(0);const before=await signature(page);await workspace(page,'fusion');expect(await signature(page),label).toEqual(before);await workspace(page,'network')}
 for(const name of ['수업 대시보드','프로젝트 · 과제 생성','학생별 평가 지원','팀별 모니터링','과목 설정']){await nav(page,name);await compare(name)}
 await nav(page,'프로젝트 · 과제 생성')
 for(const name of ['AI 운영 방식','학생 미리보기']){await page.locator('.step-tabs').getByRole('button',{name:new RegExp(name)}).click();await compare(name);await expect(page.locator('.step-tabs [aria-current=step]')).toContainText(name)}
 await nav(page,'과목 설정')
 for(const name of ['교육과정 · 학습 목표','평가 운영 기준','AI 운영 기본 정책','수업 일정','기준 문서 관리']){await page.locator('.settings-tabs').getByRole('button',{name,exact:true}).click();await compare(name)}
 await role(page,true)
 for(const name of ['팀 대시보드','프로젝트 작업실','팀 자료','팀 채팅','개인 AI 지원','나의 학습 기록']){await nav(page,name);await compare(name)}
 await nav(page,'프로젝트 작업실')
 for(const name of ['수행 보드']){await page.getByRole('button',{name,exact:true}).click();await compare(name);await expect(page.locator('.fusion-studio-tabs [aria-pressed=true]')).toHaveText(name)}
 expect(errors).toEqual([])
})
test('동일한 교수자 평가 화면에 융합 수행과 지도 요청이 연결되고 자료는 분리 저장된다',async({page})=>{
 await page.goto('/');await workspace(page,'fusion');await role(page,true);await nav(page,'프로젝트 작업실')
 await page.getByLabel('언어·명령 체계').fill('Python · 이전 학기 지식 적용');await page.getByRole('button',{name:'선택 이유와 기획 저장'}).click()
 await nav(page,'개인 AI 지원');await page.getByLabel('개인 질문').fill('자료에 없는 질문을 어떻게 처리하나요?');await page.getByRole('button',{name:'AI에게 질문하기'}).click();await expect(page.locator('main')).not.toContainText(/L[1-4]/)
 await page.getByLabel('공유할 지도 요청').fill('모의 검증 다음에 실제 API의 어떤 조건을 확인할까요?');await page.getByRole('button',{name:'지도 요청 보내기'}).click()
 await nav(page,'프로젝트 작업실');await page.getByRole('button',{name:'실행 및 검증',exact:true}).click();await expect(page.getByRole('button',{name:'수행자료 검토 요청',exact:true})).toBeDisabled()
 await page.getByLabel('수행 방법과 도구 선택 이유').fill('고정 JSON을 React 화면에 연결해 비교')
 await page.getByLabel('산출물·검증 조건·관찰 결과').fill('검증표.md / 자료 없음은 답변 보류, 학번은 가림')
 await page.getByLabel('결과 해석과 목표 충족 설명').fill('출처를 확인하고 자료 없음·개인정보 조건을 비교했다. 실제 사용자 검증이 더 필요하다.')
 await page.getByRole('button',{name:'수행자료 검토 요청',exact:true}).click()
 await nav(page,'팀 대시보드');await expect(page.locator('.current-work-result')).toContainText('실제 사용자 검증이 더 필요하다')
 await role(page,false);await nav(page,'팀별 모니터링');await page.locator('.stage-map-row').first().click();await expect(page.locator('.team-detail')).toContainText('모의 검증 다음에 실제 API');await expect(page.locator('.team-detail')).toContainText('Python · 이전 학기 지식 적용')
 await page.getByRole('button',{name:'가이던스 제안',exact:true}).click();await page.getByLabel('학생의 사고를 이끌 질문').fill('실제 입력과 모의 입력의 차이를 설명하세요.');await page.getByRole('button',{name:'제안 저장',exact:true}).click()
 await nav(page,'학생별 평가 지원');await page.getByLabel('학생 선택').selectOption('유송민');await expect(page.locator('.evidence-list')).toContainText('프로젝트 수행자료와 검증 기록');await expect(page.locator('main')).not.toContainText('자료에 없는 질문을 어떻게 처리하나요?');await expect(page.locator('.attainment-table')).toContainText('내용 검토 전에는 점수를 추정하지 않습니다.')
 await page.getByLabel('교수자 피드백',{exact:true}).fill('조건별 결과를 비교한 근거를 확인했습니다.');await page.getByRole('button',{name:'평가 저장',exact:true}).click()
 await role(page,true);await nav(page,'나의 학습 기록');await expect(page.locator('main')).toContainText('실제 입력과 모의 입력');await expect(page.locator('main')).toContainText('조건별 결과를 비교한 근거')
 await workspace(page,'network');await expect(page.locator('main')).not.toContainText('조건별 결과를 비교한 근거');await workspace(page,'fusion');await expect(page.locator('main')).toContainText('조건별 결과를 비교한 근거')
})
test('공통 화면의 데스크톱·태블릿 배치와 시나리오별 캡처',async({page})=>{
 test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'})
 for(const width of [1440,1180,820,390]){await page.setViewportSize({width,height:1080});await page.goto('/')
 for(const id of ['network','fusion'] as const){await workspace(page,id)
 for(const name of ['수업 대시보드','학생별 평가 지원','팀별 모니터링','과목 설정']){await nav(page,name);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+name+width).toBe(true);if(width===1440||width===820)await page.screenshot({path:`.impeccable/review/unified-${id}-${name}-${width}.png`,fullPage:true})}
 await role(page,true)
 for(const name of ['팀 대시보드','프로젝트 작업실','팀 자료','개인 AI 지원','나의 학습 기록']){await nav(page,name);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+name+width).toBe(true);if(width===1440||width===820)await page.screenshot({path:`.impeccable/review/unified-${id}-${name}-${width}.png`,fullPage:true})}
 await nav(page,'프로젝트 작업실');await page.getByRole('button',{name:'실행 및 검증',exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`.impeccable/review/unified-${id}-simulation-${width}.png`,fullPage:true});await role(page,false)
 }
 }
})
