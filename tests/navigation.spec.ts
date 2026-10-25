import {test,expect,type Page} from '@playwright/test'

async function menu(page:Page){
 const opener=page.getByRole('button',{name:'수업 메뉴 열기',exact:true})
 if(await opener.isVisible() && !await page.locator('.sidebar.open').count())await opener.click()
}
async function nav(page:Page,name:string){await menu(page);await page.locator('.sidebar nav').getByRole('button',{name,exact:true}).click()}
async function role(page:Page,student:boolean){await menu(page);await page.getByRole('button',{name:'프로필 전환',exact:true}).click();await page.getByRole('button',{name:student?/유송민 학생/:/강병준 교수자/}).click()}
async function workspace(page:Page,id:'network'|'fusion'){
 await menu(page);await page.getByRole('button',{name:'워크스페이스 전환',exact:true}).click()
 await page.locator('.dropdown-option').filter({hasText:id==='network'?'2학년 네트워크 실습':'융합 팀 프로젝트'}).click()
}

for(const id of ['network','fusion'] as const)test(`${id}: 작업실 탭과 전체 메뉴 왕복 시 이전 화면 제거`,async({page})=>{
 const errors:string[]=[]
 page.on('pageerror',error=>errors.push(error.message))
 page.on('console',message=>{if(message.type()==='error')errors.push(`${message.text()} ${message.location().url}`)})
 await page.goto('/');await workspace(page,id);await role(page,true);await nav(page,'프로젝트 작업실')
 for(let repeat=0;repeat<2;repeat++){
  await page.getByRole('button',{name:'실행 및 검증',exact:true}).click()
  await expect(page.getByRole('heading',{name:'수행자료와 검증 기록',exact:true})).toHaveCount(1)
  await page.getByRole('button',{name:'수행 보드',exact:true}).click()
  await expect(page.locator('.fusion-kanban')).toHaveCount(1)
  await expect(page.getByRole('heading',{name:'수행자료와 검증 기록',exact:true})).toHaveCount(0)
  await expect(page.getByLabel('명령·요청',{exact:true})).toHaveCount(0)
  await page.getByRole('button',{name:'기획·기술 선택',exact:true}).click()
  await expect(page.getByRole('heading',{name:'문제에서 수행 계획까지',exact:true})).toHaveCount(1)
  await expect(page.locator('.fusion-kanban')).toHaveCount(0)
 }
 await page.getByRole('button',{name:'실행 및 검증',exact:true}).click()
 for(const name of ['팀 대시보드','팀 자료','팀 채팅','개인 AI 지원','나의 학습 기록']){
  await nav(page,name)
  await expect(page.locator('h1')).toHaveText(name)
  await expect(page.locator('.sidebar nav [aria-current="page"]')).toHaveText(name)
  await expect(page.getByRole('heading',{name:'수행자료와 검증 기록',exact:true})).toHaveCount(0)
  await expect(page.getByLabel('명령·요청',{exact:true})).toHaveCount(0)
  await expect(page.locator('.fusion-studio-tabs')).toHaveCount(0)
 }
 await role(page,false)
 for(const name of ['수업 대시보드','프로젝트 · 과제 생성','학생별 평가 지원','팀별 모니터링','과목 설정']){
  await nav(page,name)
  await expect(page.locator('h1')).toHaveText(name)
  await expect(page.locator('.sidebar nav [aria-current="page"]')).toHaveText(name)
  await expect(page.locator('#student-main')).toHaveCount(0)
 }
 expect(errors).toEqual([])
})

test('태블릿 프로필 전환 후 숨겨진 메뉴의 재등장 방지',async({page})=>{
 await page.setViewportSize({width:820,height:1180});await page.goto('/')
 await role(page,true);await nav(page,'팀 채팅');await role(page,false)
 await expect(page.locator('.sidebar-backdrop')).toHaveCount(0)
 await expect(page.locator('.sidebar.open')).toHaveCount(0)
 await nav(page,'학생별 평가 지원');await expect(page.locator('h1')).toHaveText('학생별 평가 지원')
})

test('융합 수행자료 초안의 메뉴·역할·워크스페이스 왕복 보존',async({page})=>{
 await page.goto('/');await workspace(page,'fusion');await role(page,true);await nav(page,'프로젝트 작업실')
 await page.getByRole('button',{name:'실행 및 검증',exact:true}).click()
 await page.getByLabel('수행 방법과 도구 선택 이유').fill('고정 JSON으로 경계 조건 비교')
 await page.getByLabel('산출물·검증 조건·관찰 결과').fill('미등록 질문의 응답 보류 확인')
 await page.getByLabel('결과 해석과 목표 충족 설명').fill('실제 서버 연결은 후속 확인 필요')
 await page.getByRole('button',{name:'수행 보드',exact:true}).click()
 await page.getByRole('button',{name:'실행 및 검증',exact:true}).click()
 await expect(page.getByLabel('수행 방법과 도구 선택 이유')).toHaveValue('고정 JSON으로 경계 조건 비교')
 await nav(page,'팀 대시보드');await role(page,false);await role(page,true)
 await workspace(page,'network');await nav(page,'프로젝트 작업실');await page.getByText('다른 해결 방법으로 수행했나요?',{exact:true}).click()
 await expect(page.getByLabel('대안 접근과 선택 이유')).toBeEmpty()
 await workspace(page,'fusion')
 await expect(page.getByLabel('산출물·검증 조건·관찰 결과')).toHaveValue('미등록 질문의 응답 보류 확인')
 await page.reload();await workspace(page,'fusion');await role(page,true);await nav(page,'프로젝트 작업실');await page.getByRole('button',{name:'실행 및 검증',exact:true}).click()
 await expect(page.getByLabel('결과 해석과 목표 충족 설명')).toHaveValue('실제 서버 연결은 후속 확인 필요')
})

test('질문·지도 요청·작업실 바로가기와 화면 크기별 전환',async({page})=>{
 test.setTimeout(60000)
 await page.goto('/');await role(page,true);await page.emulateMedia({reducedMotion:'reduce'})
 for(const {width,height} of [{width:1440,height:1080},{width:1180,height:820},{width:820,height:1180}]){
  await page.setViewportSize({width,height});await nav(page,'팀 대시보드')
  await page.getByRole('button',{name:'막힌 부분 질문하기',exact:true}).click()
  await expect(page.getByLabel('개인 질문',{exact:true})).toBeFocused()
  await expect(page.getByLabel('개인 질문',{exact:true})).toBeInViewport()
  await nav(page,'팀 대시보드');await page.getByRole('button',{name:'지도 요청과 후속 수행',exact:true}).click()
  await expect(page.getByLabel('공유할 지도 요청')).toBeFocused()
  await expect(page.getByLabel('공유할 지도 요청')).toBeInViewport()
  await page.getByRole('button',{name:'작업실에서 확인 →',exact:true}).click()
  await expect(page.getByRole('button',{name:'실행 및 검증',exact:true})).toHaveAttribute('aria-pressed','true')
  await expect(page.locator('h1')).toBeFocused()
  await page.getByRole('button',{name:'수행 보드',exact:true}).focus();await page.keyboard.press('Enter')
  await expect(page.getByRole('button',{name:'수행 보드',exact:true})).toHaveAttribute('aria-pressed','true')
  await expect(page.getByLabel('명령·요청',{exact:true})).toHaveCount(0)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  expect(await page.evaluate(()=>{
   const ids=[...document.querySelectorAll('[id]')].map(element=>element.id)
   return ids.filter((id,index)=>ids.indexOf(id)!==index)
  })).toEqual([])
  await page.screenshot({path:`.impeccable/review/navigation-board-${width}.png`,fullPage:true})
 }
})
